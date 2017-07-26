<?php

namespace WhereGroup\CoreBundle\Controller;

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

        $this->denyAccessUnlessGranted(array('view', 'edit'), $metadata);

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
     * @Route("/{profile}/delete/{id}", name="metadata_delete")
     * @Method("POST")
     */
    public function deleteAction($profile, $id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);

        $this->denyAccessUnlessGranted(array('view', 'edit'), $metadata);

        $this->init($profile);

        $form = $this->createFormBuilder($metadata)
            ->add('delete', 'submit', array('label' => 'ok'))
            ->getForm()
            ->submit($this->data['request']);

        if ($form->isValid()) {
            $this->get('metador_metadata')->deleteById($id);
            $this->get('metador_logger')->flashSuccess('metadata', 'profile', 'delete', 'source', 'identifier', 'Erfolgreich gelöscht.');
        } else {
            $this->get('metador_logger')->flashError('metadata', 'profile', 'delete', 'source', 'identifier', 'Eintrag konnte nicht gelöscht werden.');
        }

        return $this->redirectToRoute('metadata_index', array('profile' => $profile));
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
        $this->data['template'] = $this->data['className'] . '::';
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
     * @param $profile
     * @param null $entity
     * @return array
     */
    private function getParams($profile, $entity = null)
    {
        $params = array();
        $params['profile'] = $profile;
        $params['examples'] = $this->getExample();
        $params['hasGroupAccess'] = true;
        $params['groups'] = array();
        $params['hasAccess'] = true;

        /** @var Metadata $entity */
        if (!is_null($entity)) {
            $this->data['p'] = $entity->getObject();
            $this->data['p']['_dateStamp'] = date("Y-m-d");

            $params['id'] = $entity->getId();
            $params['hasAccess'] = $this->isGranted('edit', $entity);
            $params['public'] = $entity->getPublic();
            $params['entity'] = $entity;
            $params['hasGroupAccess'] = ($this->data['user']->getId() == $entity->getInsertUser()->getId());

            foreach ($entity->getGroups() as $group) {
                $params['groups'][$group->getId()] = array(
                    'name'   => $group->getRole(),
                    'active' => true
                );
            }
        }

        if ($params['hasGroupAccess']) {
            foreach ($this->data['user']->getGroups() as $group) {
                if (!isset($params['groups'][$group->getId()])) {
                    if (substr($group->getRole(), 0, 12) === 'ROLE_SYSTEM_') {
                        continue;
                    }

                    $params['groups'][$group->getId()] = array(
                        'name'   => $group->getRole(),
                        'active' => false
                    );
                }
            }
        }

        $params['p'] = $this->data['p'];

        return $params;
    }

    /**
     * @param $profile
     * @param $template
     * @param null $entity
     * @return \Symfony\Component\HttpFoundation\Response
     */
    private function renderResponse($profile, $template, $entity = null)
    {
        return $this->get('templating')->renderResponse(
            $this->getTemplate($template),
            $this->getParams($profile, $entity)
        );
    }

    /**
     * @return array
     */
    private function getExample()
    {
        return $this
            ->container
            ->get('metador_wizard')
            ->getExamples(
                $this
                    ->get('kernel')
                    ->locateResource('@' . $this->data['className'] . '/Resources/config/wizard/')
            );
    }
}
