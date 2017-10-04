<?php

namespace WhereGroup\CoreBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Response;
use WhereGroup\CoreBundle\Component\AjaxResponse;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;
use WhereGroup\UserBundle\Entity\User;

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
     */
    public function newAction($source, $profile)
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_USER');

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
            'userGroups' => $this->getRoles()
        )));
    }

    /**
     * @Route("/{profile}/edit/{id}", name="metadata_edit")
     * @Method("GET")
     * @param $profile
     * @param $id
     * @return Response
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
            'userGroups' => $this->getRoles()
        )));
    }

    /**
     * @return array
     */
    private function getRoles()
    {
        /** @var User $user */
        $user = $this->get('metador_user')->getUserFromSession();

        $roles = array();

        foreach ($user->getRoles() as $role) {
            if (!strstr($role, 'ROLE_SYSTEM_')) {
                $roles[] = $role;
            }
        }

        return $roles;
    }

    /**
     * @Route("/{source}/{profile}/save", name="metadata_save")
     * @Method("POST")
     */
    public function saveAction($source, $profile)
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_USER');

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
     */
    public function confirmAction($profile, $id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);

        $this->denyAccessUnlessGranted(array('view', 'edit'), $metadata->getObject());

        $this->init($profile);

        return $this->get('templating')->renderResponse(
            $this->getTemplate('confirm'),
            array(
                'id'      => $id,
                'profile' => $profile,
                'form'    => $this
                    ->createFormBuilder($metadata)
                    ->add('delete', 'submit', array('label' => 'ok'))
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
     */
    public function deleteAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);

        $this->denyAccessUnlessGranted(array('view', 'edit'), $metadata->getObject());

        $form = $this->createFormBuilder($metadata)
            ->add('delete', 'submit', array('label' => 'ok'))
            ->getForm()
            ->submit($this->get('request_stack')->getCurrentRequest());

        if ($form->isValid()) {
            $this->get('metador_metadata')->deleteById($id);
            $this->get('metador_logger')->flashSuccess('metadata', 'profile', 'delete', 'source', 'identifier', 'Erfolgreich gelöscht.');
        } else {
            $this->get('metador_logger')->flashError('metadata', 'profile', 'delete', 'source', 'identifier', 'Eintrag konnte nicht gelöscht werden.');
        }

        return $this->redirectToRoute('metador_home');
    }

    /**
     * @Route("/profile/test/{id}", name="metadata_test")
     * @Template()
     */
    public function testAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $object1  = $metadata->getObject();

        $object2 = $this->get('metador_metadata')->xmlToObject(
            $this->get('metador_metadata')->objectToXml($object1),
            $object1['_profile']
        );

        foreach ($object1 as $key => $value) {
            if (substr($key, 0, 1) !== '_') {
                continue;
            }

            $object2[$key] = $value;
        }

        $object2['_profile'] = $object1['_profile'];

        $arr1 = array();
        $arr2 = array();
        $this->flatten($object1, $arr1);
        $this->flatten($object2, $arr2);

        return array(
            'result' => $this->test($arr1, $arr2)
        );
    }

    /**
     * @param $arr1
     * @param $arr2
     * @return array
     */
    private function test($arr1, $arr2)
    {
        ksort($arr1);
        ksort($arr2);

        $result = array(
            'status' => 1,
            'data'   => array()
        );

        foreach ($arr1 as $key => $value) {
            if (isset($arr2[$key]) && $value === $arr2[$key]) {
                $result['data'][$key] = ($value !== "") ? 1 : 2;
            } else {
                $result['data'][$key] = 0;
                $result['status'] = 0;
            }
        }

        return $result;
    }

    /**
     * @param $array
     * @param $result
     * @param null $prefix
     */
    private function flatten($array, &$result, $prefix = null)
    {
        foreach ($array as $key => $value) {
            if (!is_null($prefix)) {
                $key = $prefix . '_' . $key;
            }

            if (is_array($value)) {
                $this->flatten($value, $result, $key);
            } else {
                $result[$key] = $value;
            }
        }
    }

    /**
     * @param $profile
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
}
