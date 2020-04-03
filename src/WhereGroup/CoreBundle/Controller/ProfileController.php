<?php

namespace WhereGroup\CoreBundle\Controller;

use Doctrine\DBAL\ConnectionException;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use DOMAttr;
use DOMDocument;
use DOMElement;
use DOMText;
use DOMXPath;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Twig\Error\Error;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;
use WhereGroup\CoreBundle\Component\AjaxResponse;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataNotFoundException;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;
use WhereGroup\CoreBundle\Service\Metadata\Metadata;

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
     * @Route("/{source}/{profile}/new", name="metadata_new", methods={"GET"})
     * @param $source
     * @param $profile
     * @return Response
     * @throws Exception
     */
    public function newAction($source, $profile)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');

        $template = $this
                ->get('metador_plugin')
                ->getPluginClassName($profile) . ':Profile:form.html.twig';

        return $this->render($template, [
            'p' => [
                '_source'   => $source,
                '_profile'  => $profile,
                '_public'   => false,
                '_groups'   => [],
            ],
            'userGroups' => $this->get('metador_user')->getRoles(),
            'profile'    => $profile
        ]);
    }

    /**
     * @Route("/{source}/{profile}/use/{uuid}", name="metadata_use", methods={"GET"})
     * @param $source
     * @param $profile
     * @param $uuid
     * @return Response
     * @throws MetadataException
     */
    public function useAction($source, $profile, $uuid)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');

        $template = $this
                ->get('metador_plugin')
                ->getPluginClassName($profile) . ':Profile:form.html.twig';

        $entity = $this->get(Metadata::class)->findById($uuid);

        if (!$entity) {
            throw new MetadataNotFoundException($uuid . " not found.");
        }

        $p = $entity->getObject();

        unset($entity);

        unset(
            $p['fileIdentifier'],
            $p['_insert_time'],
            $p['_insert_user'],
            $p['_lock_time'],
            $p['_lock_user'],
            $p['_locked'],
            $p['_remove_lock'],
            $p['_update_time'],
            $p['_update_user'],
            $p['_username'],
            $p['_uuid'],
            $p['dateStamp']
        );

        $p['_source']  = $source;
        $p['_profile'] = $profile;
        $p['_public']  = false;
        $p['_groups']  = [];

        return $this->render($template, [
            'p'          => $p,
            'userGroups' => $this->get('metador_user')->getRoles(),
            'profile'    => $profile
        ]);
    }

    /**
     * @param $profile
     * @param $id
     * @return Response
     * @throws MetadataException
     * @throws Exception
     * @Route("/{profile}/edit/{id}", name="metadata_edit", methods={"GET"})
     */
    public function editAction($profile, $id)
    {
        $metadata = $this->get(Metadata::class)->findById($id);

        if (!$metadata) {
            throw new MetadataNotFoundException($id . " not found.");
        }

        $p = $metadata->getObject();
        $this->denyAccessUnlessGranted('view', $p);

        if ($this->get('security.authorization_checker')->isGranted('edit', $p)) {
            $this->get(Metadata::class)->lock($metadata);
        }

        $template = $this
                ->get('metador_plugin')
                ->getPluginClassName($profile) . ':Profile:form.html.twig';

        return $this->render($template, [
            'p' => $metadata->getObject(),
            'userGroups' => $this->get('metador_user')->getRoles(),
            'profile'    => $profile
        ]);
    }

    /**
     * @param $source
     * @param $profile
     * @param Request $request
     * @return AjaxResponse
     * @throws ConnectionException
     * @Route("/{source}/{profile}/save", name="metadata_save", methods={"POST"})
     */
    public function saveAction($source, $profile, Request $request)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');

        $p = $request->request->get('p');
        $submitType = $request->request->get('submit');
        $response = [];
        $uuid     = null;

        $id = empty($p['_uuid']) ? null : $p['_uuid'];


        // If id exists, get the metadata to check permission and keep some settings.
        $metadata = $this->get(Metadata::class)->findById($id);

        if ($metadata) {
            // On abort unlock metadata and redirect to home
            if ($submitType === 'abort') {
                $this->get(Metadata::class)->unlock($metadata);
                $this
                    ->get('metador_frontend_command')
                    ->redirect($response, $this->generateUrl('metador_home'));

                return new AjaxResponse($response);
            }

            $oldObject = $metadata->getObject();
            $this->denyAccessUnlessGranted('edit', $oldObject);

            // Keep groups if user is not owner.
            if (!$this->isGranted('edit_group', $oldObject)) {
                $p['_groups'] = isset($oldObject['_groups']) ? $oldObject['_groups'] : [];
            }

            // Keep owner
            $p['_insert_user'] = $metadata->getinsertUser()->getUsername();
            $p['_insert_time'] = date('Y-m-d', $metadata->getInsertTime());

            if ($submitType === 'close') {
                $p['_remove_lock'] = true;
            }
        }

        $this->get(Metadata::class)->db->beginTransaction();
        try {
            if ($metadata) {
                $metadata = $this->get(Metadata::class)->updateByObject($p, [ 'source'  => $source, 'profile' => $profile ]);
            } else {
                $metadata = $this->get(Metadata::class)->insertByObject($p, ['source' => $source, 'profile' => $profile]);
            }

            $this->get('metador_frontend_command')->changeLocation(
                $response,
                $this->generateUrl('metadata_edit', [
                    'source'  => $metadata->getSource(),
                    'profile' => $metadata->getProfile(),
                    'id'      => $metadata->getId()
                ])
            );

            $this->get(Metadata::class)->db->transactionCommit();
            $this->get(Metadata::class)->db->dispatchFlush();
        } catch (Exception $e) {
            $this->get(Metadata::class)->db->transactionRollBack();

            if ($e instanceof MetadataException) {
                $this->get('metador_frontend_command')->displayError($response, $e->getMessage());
            }
        }

        $response = array_merge_recursive($response, [
            'metadata' => [
                'id'   => $id
            ]
        ]);

        // Add redirect command to response
        if ($submitType === 'close') {
            $this
                ->get('metador_frontend_command')
                ->redirect($response, $this->generateUrl('metador_home'));
        }

        return new AjaxResponse($response);
    }

    /**
     * @param $profile
     * @param $id
     * @return Response
     * @throws MetadataException
     * @throws Exception
     * @Route("/{profile}/confirm/{id}", name="metadata_confirm", methods={"GET"})
     */
    public function confirmAction($profile, $id)
    {
        $metadata = $this->get(Metadata::class)->findById($id);

        if (!$metadata) {
            throw new MetadataNotFoundException($id . " not found.");
        }

        $this->denyAccessUnlessGranted(['view', 'edit'], $metadata->getObject());

        $this->init($profile);

        return $this->render(
            $this->getTemplate('confirm'),
            [
                'id'      => $id,
                'profile' => $profile,
                'form'    => $this
                    ->createFormBuilder($metadata)
                    ->add('delete', SubmitType::class, ['label' => 'ok'])
                    ->getForm()
                    ->createView(),
            ]
        );
    }

    /**
     * @param $id
     * @return RedirectResponse
     * @throws MetadataException
     * @Route("/delete/{id}", name="metadata_delete", methods={"POST"})
     */
    public function deleteAction($id)
    {
        $metadata = $this->get(Metadata::class)->findById($id);

        if (!$metadata) {
            throw new MetadataNotFoundException($id . " not found.");
        }

        $this->denyAccessUnlessGranted(['view', 'edit'], $metadata->getObject());

        $form = $this->createFormBuilder($metadata)
            ->add('delete', SubmitType::class, ['label' => 'ok'])
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $this->get(Metadata::class)->delete($metadata);
        }

        return $this->redirectToRoute('metador_home');
    }

    /**
     * @param $id
     * @return Response
     * @throws MetadataException
     * @Route("/profile/validate/{id}", name="metadata_validate")
     */
    public function validateAction($id)
    {
        $metadata = $this->get(Metadata::class)->findById($id);

        if (!$metadata) {
            throw new MetadataNotFoundException($id . " not found.");
        }

        $p = $metadata->getObject();

        $this->denyAccessUnlessGranted(['view', 'edit'], $metadata->getObject());

        $message = "You can only validate public metadata.";
        $debug   = [];

        if ($p['_public'] == true) {
            $this->get('metador_metadata_validator')->isValid($p, $debug);
            $message = "";
        }

        return $this->render('@MetadorCore/Profile/validate.html.twig', [
            'id'      => $id,
            'debug'   => $debug,
            'message' => $message
        ]);
    }

    /**
     * @param $id
     * @return Response
     * @throws MetadataException
     * @Route("/profile/error/{id}", name="metadata_error")
     */
    public function errorAction($id)
    {
        $metadata = $this->get(Metadata::class)->findById($id);

        if (!$metadata) {
            throw new MetadataNotFoundException($id . " not found.");
        }

        $p = $metadata->getObject();
        $this->denyAccessUnlessGranted(['view', 'edit'], $p);

        return $this->render('@MetadorCore/Profile/errors.html.twig', [
            'p' => $p
        ]);
    }

    /**
     * @param $id
     * @param Request $request
     * @return Response
     * @throws MetadataException
     * @throws MetadataNotFoundException
     * @Route("/profile/xpath/{id}", name="metadata_xpath")
     */
    public function xpathAction($id, Request $request)
    {
        $metadata = $this->get(Metadata::class)->findById($id);

        if (!$metadata) {
            throw new MetadataNotFoundException($id . " not found.");
        }

        $this->denyAccessUnlessGranted(['view', 'edit'], $metadata->getObject());

        if ($request->getMethod() == 'POST') {
            $query = $request->request->get('xpath', '/*');

            $xml   = $this->get(Metadata::class)->getProcessor()->objectToXml($metadata->getObject());
            $xml   = preg_replace('/(>)([\t\n ^<]+)(<)/s', '${1}${3}', $xml);

            $doc = new DOMDocument();
            $doc->loadXml($xml);
            $doc->preserveWhiteSpace = false;
            $doc->formatOutput = true;

            $xpath   = new DOMXPath($doc);
            $entries = @$xpath->query($query);
            $html    = '';

            if ($entries != false) {
                foreach ($entries as $entry) {
                    if ($entry instanceof DOMElement) {
                        /** @var DOMElement $entry */
                        $entry->ownerDocument->preserveWhiteSpace = false;
                        $entry->ownerDocument->formatOutput = true;

                        $html .= '<pre class="xml-code">'
                            . htmlentities($entry->ownerDocument->saveXML($entry)) . '</pre>';
                    } elseif ($entry instanceof DOMText) {
                        /** @var DOMText $entry */
                        $html .= '<pre class="xml-code">' . htmlentities($entry->wholeText) . '</pre>';
                    } elseif ($entry instanceof DOMAttr) {
                        /** @var DOMAttr $entry */
                        $html .= '<pre class="xml-code">' . htmlentities($entry->nodeValue) . '</pre>';
                    } else {
                        $html .= get_class($entry) . ' is not supported.';
                    }
                }
            }

            return new AjaxResponse(['html' => $html]);
        }

        return $this->render('@MetadorCore/Profile/xpath.html.twig', [
            'id'    => $id,
            'xpath' => $request->get('xpath', '/*')
        ]);
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
     * @param $id
     * @return Response
     * @throws MetadataException
     * @throws MetadataNotFoundException
     * @Route("/profile/test/{id}", name="metadata_test")
     */
    public function testAction($id)
    {
        $metadata = $this->get(Metadata::class)->findById($id);

        if (!$metadata) {
            throw new MetadataNotFoundException($id . " not found.");
        }

        $object1  = $metadata->getObject();
        $object2  = $this->get(Metadata::class)->getProcessor()->xmlToObjectByProfile(
            $this->get(Metadata::class)->getProcessor()->objectToXml($object1),
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

        return $this->render('@MetadorCore/Profile/test.html.twig', [
            'result' => $result,
            'id'     => $id
        ]);
    }


    /**
     * @param Request $request
     * @return AjaxResponse
     * @throws Error
     * @throws NonUniqueResultException
     * @throws OptimisticLockException
     * @throws ORMException
     * @Route("/profile/help", name="metadata_help")
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
     * @throws Exception
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
