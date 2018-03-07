<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
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

        return new Response($this->get('metador_core')->render($template, array(
            'p' => array(
                '_source'  => $source,
                '_profile' => $profile,
                '_public'  => false,
                '_groups'  => array()
            ),
            'userGroups' => $this->get('metador_user')->getRoles(),
            'profile'    => $profile
        )));
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
     * @return AjaxResponse
     * @throws MetadataException
     * @throws \Exception
     */
    public function saveAction($source, $profile)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');

        $response = array();
        $uuid = false;
        $request  = $this->get('request_stack')->getCurrentRequest()->request;

        $p = $request->get('p');

        $this->get('metador_metadata')->updateObject($p, $source, $profile, null, null);

        $id = empty($p['_id']) || !is_numeric($p['_id']) ? null : (int)$p['_id'];

        if (!is_null($id)) {
            $metadata = $this->get('metador_metadata')->getById($id);
            $this->denyAccessUnlessGranted('edit', $metadata->getObject());
        }

        if ($request->get('submit') === 'abort') {
            if (!is_null($id)) {
                $this->get('metador_metadata')->unlock($id);
            }

            $this
                ->get('metador_frontend_command')
                ->redirect($response, $this->generateUrl('metador_home'));

            return new AjaxResponse($response);
        } elseif ($request->get('submit') === 'close') {
            $p['_remove_lock'] = true;
        }

        try {
            $metadata = $this->get('metador_metadata')->saveObject($p, $id);
            $id = $metadata->getId();
            $uuid = $metadata->getUuid();

            $this->get('metador_frontend_command')->changeLocation(
                $response,
                $this->generateUrl('metadata_edit', array(
                    'source' => $source,
                    'profile' => $profile,
                    'id' => $id
                ))
            );
        } catch (MetadataException $e) {
            $this->get('metador_metadata')->error($metadata, 'save', $e->getMessage(), array());
        }

        $response = array_merge_recursive($response, array(
            'metadata' => array(
                'id'   => $id,
                'uuid' => $uuid
            )
        ));

        // Add redirect command to response
        if ($request->get('submit') === 'close') {
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
            $this->log('succes', 'delete', $id, 'Erfolgreich gelöscht.');
        } else {
            $this->log('error', 'delete', $id, 'Eintrag konnte nicht gelöscht werden.');
        }

        return $this->redirectToRoute('metador_home');
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
                    }
                }
            }

            return new AjaxResponse(['html' => $html]);
        }

        return $this->render('@MetadorCore/Profile/xpath.html.twig', array(
            'id' => $id
        ));
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

        $arr1 = array();
        $arr2 = array();

        ArrayParser::flatten($object1, $arr1, true);
        ArrayParser::flatten($object2, $arr2, true);

        ksort($arr1);
        ksort($arr2);

        dump($arr1);
        dump($arr2);



        $key1 = array_keys($arr1);
        $key2 = array_keys($arr2);

        $p1 = 0;
        $p2 = 0;

        $result = [];



        while (isset($key1[$p1]) || isset($key2[$p2])) {
            if (isset($key1[$p1]) && isset($key2[$p2])) {
                if ($key1[$p1] == $key2[$p2]) {
                    $this->prepareTestResult($result, $key1[$p1], $arr1[$key1[$p1]], $key2[$p2], $arr2[$key2[$p2]]);
                    $p1++;
                    $p2++;
                    continue;
                }

                if (in_array($key1[$p1], $key2) && !in_array($key2[$p2], $key1)) {
                    $this->prepareTestResult($result, null, null, $key2[$p2], $arr2[$key2[$p2]]);
                    $p2++;
                    continue;
                }

                if (in_array($key2[$p2], $key1) && !in_array($key1[$p1], $key2)) {
                    $this->prepareTestResult($result, $key1[$p1], $arr1[$key1[$p1]], null, null);
                    $p1++;
                    continue;
                }

                if (!in_array($key2[$p2], $key1) && !in_array($key1[$p1], $key2)) {
                    $this->prepareTestResult($result, $key1[$p1], $arr1[$key1[$p1]], null, null);
                    $p1++;
                    continue;
                }
            } elseif (isset($key1[$p1]) && !isset($key2[$p2])) {
                $this->prepareTestResult($result, $key1[$p1], $arr1[$key1[$p1]], null, null);
                $p1++;
                continue;
            } elseif (!isset($key1[$p1]) && isset($key2[$p2])) {
                $this->prepareTestResult($result, null, null, $key2[$p2], $arr2[$key2[$p2]]);
                $p2++;
                continue;
            }

            $p1++;
            $p2++;
        }

        return $this->render('@MetadorCore/Profile/test.html.twig', array(
            'result' => $result,
        ));
    }

    /**
     * @param $result
     * @param $k1
     * @param $v1
     * @param $k2
     * @param $v2
     */
    private function prepareTestResult(&$result, $k1, $v1, $k2, $v2)
    {
        $ignoreList = [
            '_id',
            '_insert_time',
            '_insert_user',
            '_lock_time',
            '_lock_user',
            '_locked',
            '_profile',
            '_public',
            '_remove_lock',
            '_source',
            '_update_time',
            '_update_user',
            '_username',
            '_uuid',
        ];

        if (in_array($k1, $ignoreList) || in_array($k2, $ignoreList)) {
            return;
        }

        $status = 'error';

        if (!empty($v1) && !is_null($k1) && !is_null($k2) && $this->normalize($v1) === $this->normalize($v2)) {
            $status = 'success';
        } elseif (!is_null($k1) && !is_null($k2) && $this->normalize($v1) === $this->normalize($v2)) {
            $status = 'info';
        }

        $result[$status][] = [
            'k1' => $k1,
            'v1' => $v1,
            'k2' => $k2,
            'v2' => $v2,
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
        $this->data['p'] = $this->data['request']->request->get('p', array());
        $this->data['p']['_dateStamp'] = date("Y-m-d");
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
    private function log($type, $operation, $id, $message, $parameter = array())
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
