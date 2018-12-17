<?php

namespace WhereGroup\CoreBundle\Controller;

use Doctrine\ORM\EntityManager;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\OptimisticLockException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use WhereGroup\CoreBundle\Component\AjaxResponse;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;

/**
 * @Route("/metadata")
 */
class ProfileController extends Controller
{
    private $data = null;

    public function __destruct()
    {
        unset($this->data);
    }

    /**
     * @Route("/{source}/{profile}/new", name="metadata_new")
     * @Method("GET")
     * @param $source
     * @param $profile
     * @return Response
     * @throws \Exception
     */
    public function newAction($source, $profile)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');

        $template = $this
                ->get('metador_plugin')
                ->getPluginClassName($profile) . ':Profile:form.html.twig';

        $uuid = $this->get('metador_metadata')->generateUuid();

        return $this->render($template, array(
            'p' => array(
                '_source'   => $source,
                '_profile'  => $profile,
                '_public'   => false,
                '_groups'   => [],
//                '_uuid'     => $uuid,
//                'fileIdentifier' => $uuid,
//                'dateStamp' => (new \DateTime)->format('Y-m-d')
            ),
            'userGroups' => $this->get('metador_user')->getRoles(),
            'profile'    => $profile
        ));
    }

    /**
     * @Route("/{profile}/edit/{id}", name="metadata_edit")
     * @Method("GET")
     * @param $profile
     * @param $id
     * @return Response
     * @throws MetadataException
     * @throws \Exception
     */
    public function editAction($profile, $id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $p = $metadata->getObject();

        $this->denyAccessUnlessGranted('view', $p);

        if ($this->get('metador_core')->isGranted('edit', $p)) {
            $this->get('metador_metadata')->lock($id);
        }

        $template = $this
                ->get('metador_plugin')
                ->getPluginClassName($profile) . ':Profile:form.html.twig';

        return new Response($this->get('metador_core')->render($template, array(
            'p' => $metadata->getObject(),
            'userGroups' => $this->get('metador_user')->getRoles(),
            'profile'    => $profile
        )));
    }

    /**
     * @Route("/{source}/{profile}/save", name="metadata_save")
     * @Method("POST")
     * @param $source
     * @param $profile
     * @param Request $request
     * @return AjaxResponse
     * @throws MetadataException
     * @throws \Doctrine\Common\Persistence\Mapping\MappingException
     * @throws \Doctrine\DBAL\ConnectionException
     */
    public function saveAction($source, $profile, Request $request)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');

        $p = $request->request->get('p');
        $submitType = $request->request->get('submit');
        $response = [];
        $metadata = null;
        $uuid     = null;

        $id = empty($p['_uuid']) ? null : $p['_uuid'];

        // If id exists, get the metadata to check permission and keep some settings.
        if (!is_null($id)) {
            // Check permission
            $metadata  = $this->get('metador_metadata')->getById($id);
            $oldObject = $metadata->getObject();
            $this->denyAccessUnlessGranted('edit', $oldObject);

            // Keep groups if user is not owner.
            if (!$this->isGranted('edit_group', $oldObject)) {
                $p['_groups'] = isset($oldObject['_groups']) ? $oldObject['_groups'] : [];
            }

            // Keep owner
            $p['_insert_user'] = $metadata->getinsertUser()->getUsername();
            $p['_insert_time'] = date('Y-m-d', $metadata->getInsertTime());
        }

        // On abort unlock metadata and redirect to home
        if ($submitType === 'abort') {
            // Unlock if id exists
            if (!is_null($id)) {
                $this->get('metador_metadata')->unlock($id);
            }

            $this
                ->get('metador_frontend_command')
                ->redirect($response, $this->generateUrl('metador_home'));

            return new AjaxResponse($response);

        // On close unlock after saving metadata
        } elseif ($submitType === 'close') {
            $p['_remove_lock'] = true;
        }

        /** @var EntityManager $em */
        $em = $this->getDoctrine()->getManager();
        $em->getConnection()->beginTransaction();

        try {
            $metadata = $this->get('metador_metadata')->saveObject($p, $id, [
                'source'  => $source,
                'profile' => $profile
            ]);

            $id = $metadata->getId();

            $this->get('metador_frontend_command')->changeLocation(
                $response,
                $this->generateUrl('metadata_edit', array(
                    'source' => $source,
                    'profile' => $profile,
                    'id' => $id
                ))
            );
            $em->getConnection()->commit();
        } catch (MetadataException $e) {
            $em->getConnection()->rollBack();
            $em->clear();
            $this->get('metador_metadata')->error($metadata, 'save', $e->getMessage(), []);
            $this->get('metador_frontend_command')->displayError($response, $e->getMessage());
            $submitType = null;
        } catch (\Exception $e) {
            $em->getConnection()->rollBack();
            $em->clear();
            throw $e;
        }

        $response = array_merge_recursive($response, array(
            'metadata' => array(
                'id'   => $id
            )
        ));

        // Add redirect command to response
        if ($submitType === 'close') {
            $this
                ->get('metador_frontend_command')
                ->redirect($response, $this->generateUrl('metador_home'));
        }

        return new AjaxResponse($response);
    }

    /**
     * @Route("/{profile}/confirm/{id}", name="metadata_confirm")
     * @Method("GET")
     * @param $profile
     * @param $id
     * @return Response
     * @throws MetadataException
     * @throws \Exception
     */
    public function confirmAction($profile, $id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);

        $this->denyAccessUnlessGranted(array('view', 'edit'), $metadata->getObject());

        $this->init($profile);

        return $this->render(
            $this->getTemplate('confirm'),
            array(
                'id'      => $id,
                'profile' => $profile,
                'form'    => $this
                    ->createFormBuilder($metadata)
                    ->add('delete', SubmitType::class, array('label' => 'ok'))
                    ->getForm()
                    ->createView(),
            )
        );
    }

    /**
     * @Route("/delete/{id}", name="metadata_delete")
     * @Method("POST")
     * @param $id
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     * @throws MetadataException
     */
    public function deleteAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);

        $this->denyAccessUnlessGranted(array('view', 'edit'), $metadata->getObject());

        $form = $this->createFormBuilder($metadata)
            ->add('delete', SubmitType::class, array('label' => 'ok'))
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $this->get('metador_metadata')->deleteById($id);
            $this->log('success', 'delete', $id, 'Erfolgreich gelöscht.');
        } else {
            $this->log('error', 'delete', $id, 'Eintrag konnte nicht gelöscht werden.');
        }

        return $this->redirectToRoute('metador_home');
    }

    /**
     * @Route("/profile/validate/{id}", name="metadata_validate")
     * @param $id
     * @return Response
     * @throws MetadataException
     */
    public function validateAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $p = $metadata->getObject();

        $this->denyAccessUnlessGranted(array('view', 'edit'), $metadata->getObject());

        $message = "You can only validate public metadata.";
        $debug   = [];

        if ($p['_public'] == true) {
            $this->get('metador_metadata_validator')->isValid($p, $debug);
            $message = "";
        }

        return $this->render('@MetadorCore/Profile/validate.html.twig', array(
            'id'      => $id,
            'debug'   => $debug,
            'message' => $message
        ));
    }

    /**
     * @Route("/profile/error/{id}", name="metadata_error")
     * @param $id
     * @return Response
     * @throws MetadataException
     */
    public function errorAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $p = $metadata->getObject();
        $this->denyAccessUnlessGranted(array('view', 'edit'), $p);

        return $this->render('@MetadorCore/Profile/errors.html.twig', array(
            'p' => $p
        ));
    }

    /**
     * @Route("/profile/xpath/{id}", name="metadata_xpath")
     * @param $id
     * @param Request $request
     * @return Response
     * @throws MetadataException
     * @throws \Exception
     * @throws \Twig_Error_Loader
     * @throws \Twig_Error_Runtime
     * @throws \Twig_Error_Syntax
     */
    public function xpathAction($id, Request $request)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $this->denyAccessUnlessGranted(array('view', 'edit'), $metadata->getObject());


        if ($request->getMethod() == 'POST') {
            $query = $request->request->get('xpath', '/*');
            $xml   = $this->get('metador_metadata')->objectToXml($metadata->getObject());
            $xml   = preg_replace('/(>)([\t\n ^<]+)(<)/s', '${1}${3}', $xml);

            $doc = new \DOMDocument();
            $doc->loadXml($xml);
            $doc->preserveWhiteSpace = false;
            $doc->formatOutput = true;

            $xpath   = new \DOMXPath($doc);
            $entries = @$xpath->query($query);
            $html    = '';

            if ($entries != false) {
                foreach ($entries as $entry) {
                    if ($entry instanceof \DOMElement) {
                        /** @var \DOMElement $entry */
                        $entry->ownerDocument->preserveWhiteSpace = false;
                        $entry->ownerDocument->formatOutput = true;

                        $html .= '<pre class="xml-code">'
                            . htmlentities($entry->ownerDocument->saveXML($entry)) . '</pre>';
                    } elseif ($entry instanceof \DOMText) {
                        /** @var \DOMText $entry */
                        $html .= '<pre class="xml-code">' . htmlentities($entry->wholeText) . '</pre>';
                    } elseif ($entry instanceof \DOMAttr) {
                        /** @var \DOMAttr $entry */
                        $html .= '<pre class="xml-code">' . htmlentities($entry->nodeValue) . '</pre>';
                    } else {
                        $html .= get_class($entry) . ' is not supported.';
                    }
                }
            }

            return new AjaxResponse(['html' => $html]);
        }

        return $this->render('@MetadorCore/Profile/xpath.html.twig', array(
            'id'    => $id,
            'xpath' => $request->get('xpath', '/*')
        ));
    }

    /**
     * @param array $array
     * @param array $xpath
     * @param string $subkey
     * @param string $path
     */
    private function parseXpaths(array $array, array &$xpath, $subkey = "", $path = "")
    {
        foreach ($array as $key => $value) {
            if (in_array($key, ['_cmd', '_asArray'])) {
                continue;
            }

            if (is_array($value) && isset($value['_path']) && isset($value['_data'])) {
                $this->parseXpaths(
                    $value['_data'],
                    $xpath,
                    $subkey . '_' . $key,
                    $path . '/' . $value['_path']
                );
                continue;
            }

            if (is_string($value)) {
                $xpath[
                    substr($subkey . '_' . $key, 3)
                ] = '/' . ltrim($path . '/' . $value, '/');
                continue;
            }
        }
    }

    /**
     * @Route("/profile/test/{id}", name="metadata_test")
     * @param $id
     * @return Response
     * @throws MetadataException
     * @throws \Exception
     * @throws \Twig_Error_Loader
     * @throws \Twig_Error_Runtime
     * @throws \Twig_Error_Syntax
     */
    public function testAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $object1  = $metadata->getObject();
        $object2  = $this->get('metador_metadata')->xmlToObject(
            $this->get('metador_metadata')->objectToXml($object1),
            $object1['_profile']
        );

        $class  = $this->get('metador_plugin')->getPluginClassName($object1['_profile']);
        $file   = $this->get('kernel')->locateResource('@' . $class . '/Resources/config/import.json');
        $schema = json_decode(file_get_contents($file), true);
        $xpath = [];

        $this->parseXpaths($schema, $xpath);

        $arr1 = [];
        $arr2 = [];

        ArrayParser::flatten($object1, $arr1, true);
        ArrayParser::flatten($object2, $arr2, true);

        ksort($arr1);
        ksort($arr2);

        $key1 = array_keys($arr1);
        $key2 = array_keys($arr2);

        $p1 = 0;
        $p2 = 0;

        $result = [];

        while (isset($key1[$p1]) || isset($key2[$p2])) {
            if (isset($key1[$p1]) && isset($key2[$p2])) {
                if ($key1[$p1] == $key2[$p2]) {
                    $this->prepareTestResult($result, $xpath, $key1[$p1], $arr1[$key1[$p1]], $key2[$p2], $arr2[$key2[$p2]]);
                    $p1++;
                    $p2++;
                    continue;
                }

                if (in_array($key1[$p1], $key2) && !in_array($key2[$p2], $key1)) {
                    $this->prepareTestResult($result, $xpath, null, null, $key2[$p2], $arr2[$key2[$p2]]);
                    $p2++;
                    continue;
                }

                if (in_array($key2[$p2], $key1) && !in_array($key1[$p1], $key2)) {
                    $this->prepareTestResult($result, $xpath, $key1[$p1], $arr1[$key1[$p1]], null, null);
                    $p1++;
                    continue;
                }

                if (!in_array($key2[$p2], $key1) && !in_array($key1[$p1], $key2)) {
                    $this->prepareTestResult($result, $xpath, $key1[$p1], $arr1[$key1[$p1]], null, null);
                    $p1++;
                    continue;
                }
            } elseif (isset($key1[$p1]) && !isset($key2[$p2])) {
                $this->prepareTestResult($result, $xpath, $key1[$p1], $arr1[$key1[$p1]], null, null);
                $p1++;
                continue;
            } elseif (!isset($key1[$p1]) && isset($key2[$p2])) {
                $this->prepareTestResult($result, $xpath, null, null, $key2[$p2], $arr2[$key2[$p2]]);
                $p2++;
                continue;
            }

            $p1++;
            $p2++;
        }

        return $this->render('@MetadorCore/Profile/test.html.twig', array(
            'result' => $result,
            'id'     => $id
        ));
    }


    /**
     * @Route("/profile/help", name="metadata_help")
     * @param Request $request
     * @return AjaxResponse
     * @throws NonUniqueResultException
     * @throws OptimisticLockException
     * @throws \Twig\Error\Error
     */
    public function helpAction(Request $request)
    {
        $data = [];

        if ($request->getMethod() === 'POST') {
            $this->get('metador_configuration')->set(
                $request->request->get('key', ''),
                $request->request->get('val', ''),
                'profile',
                'helptext'
            );
        } elseif ($request->getMethod() === 'GET') {
            $data['html'] = $this->get('templating')->render('@MetadorTheme/Template/helptext.html.twig', [
                'html' => $this->get('metador_configuration')->get($request->get('key', ''), 'profile', 'helptext', '')
            ]);
        }

        return new AjaxResponse($data);
    }

    /**
     * @param $result
     * @param $xpath
     * @param $k1
     * @param $v1
     * @param $k2
     * @param $v2
     */
    private function prepareTestResult(&$result, $xpath, $k1, $v1, $k2, $v2)
    {
        if (substr($k1, 0, 1) === '_' || substr($k2, 0, 1) === '_') {
            return;
        }

        $status = 'error';

        if (!empty($v1) && !is_null($k1) && !is_null($k2) && $this->normalize($v1) === $this->normalize($v2)) {
            $status = 'success';
        } elseif (!is_null($k1) && !is_null($k2) && $this->normalize($v1) === $this->normalize($v2)) {
            $status = 'info';
        }

        $i1 = preg_replace('/_[0-9]+_/', '_', $k1);
        $i2 = preg_replace('/_[0-9]+_/', '_', $k2);

        $x1 = isset($xpath[$i1]) ? $xpath[$i1] : '';
        $x2 = isset($xpath[$i2]) ? $xpath[$i2] : '';

        $result[$status][] = [
            'k1' => $k1,
            'v1' => $v1,
            'x1' => $x1,
            'k2' => $k2,
            'v2' => $v2,
            'x2' => $x2,
        ];
    }

    /**
     * @param $string
     * @return mixed
     */
    private function normalize($string)
    {
        return str_replace("\r\n", "\n", $string);
    }

    /**
     * @param $profile
     * @throws \Exception
     */
    private function init($profile)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER', null, 'Unable to access this page!');

        $this->data['request'] = $this->get('request_stack')->getCurrentRequest();
        $this->data['className'] = $this->get('metador_plugin')->getPluginClassName($profile);
        $this->data['user'] = $this->get('metador_user')->getUserFromSession();
        $this->data['template'] = $this->data['className'] . ':Profile:';
        $this->data['p'] = $this->data['request']->request->get('p', []);
        $this->data['p']['dateStamp'] = date("Y-m-d");
    }

    /**
     * @param $name
     * @return string
     */
    private function getTemplate($name)
    {
        return $this->data['template'] . $name . '.html.twig';
    }

    /**
     * @param $type
     * @param $operation
     * @param $id
     * @param $message
     * @param array $parameter
     */
    private function log($type, $operation, $id, $message, $parameter = [])
    {
        $log = $this->get('metador_logger')->newLog();

        $log->setType($type)
            ->setFlashMessage()
            ->setCategory('metadata')
            ->setOperation($operation)
            ->setIdentifier($id)
            ->setMessage($message, $parameter);

        $this->get('metador_logger')->set($log);

        unset($log);
    }
}
