<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use WhereGroup\CoreBundle\Entity\Metadata;

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
     * @Route("/{profile}/index", name="metadata_index")
     * @Method("GET")
     */
    public function indexAction($profile)
    {
        $this->init($profile);

        $params = $this->data['request']->query->all();
        $params['profile'] = $profile;
        $params['page'] = isset($params['page']) ? $params['page'] : 1;
        $params['hits'] = isset($params['hits']) ? $params['hits'] : 10;

        $metadata = $this->get('metadata')->find($params);

        return $this->get('templating')->renderResponse(
            $this->getTemplate('index'),
            array(
                'params'  => $params,
                'profile' => $profile,
                'rows'    => $metadata['result'],
                'paging'  => $metadata['paging']
            )
        );
    }

    /**
     * @Route("/{profile}/new", name="metadata_new")
     * @Method("GET")
     */
    public function newAction($profile)
    {
        $this->init($profile);

        return $this->renderResponse($profile, 'form');
    }

    /**
     * @Route("/{profile}/create", name="metadata_create")
     * @Method("POST")
     */
    public function createAction($profile)
    {
        $this->init($profile);

        return $this->renderResponse($profile, 'form', $this->get('metadata')->saveObject($this->data['p']));
    }

    /**
     * @Route("/{profile}/edit/{id}", name="metadata_edit")
     * @Method("GET")
     */
    public function editAction($profile, $id)
    {
        $this->init($profile);

        return $this->renderResponse($profile, 'form', $this->get('metadata')->getById($id));
    }

    /**
     * @Route("/{profile}/update/{id}", name="metadata_update")
     * @Method("POST")
     */
    public function updateAction($profile, $id)
    {
        $this->init($profile);

        return $this->renderResponse($profile, 'form', $this->get('metadata')->saveObject($this->data['p'], $id));
    }

    /**
     * @Route("/{profile}/use/{id}", name="metadata_use")
     * @Method({"GET"})
     */
    public function useAction($profile, $id)
    {
        $this->init($profile);

        $entity = $this->get('metadata')->getById($id);

        $this->data['p'] = $entity->getObject();
        $this->data['p']['dateStamp'] = date("Y-m-d");

        unset(
            $this->data['p']['fileIdentifier'],
            $this->data['p']['identifier']
        );

        return $this->renderResponse($profile, 'form');
    }


    /**
     * @Route("/{profile}/confirm/{id}", name="metadata_confirm")
     * @Method("GET")
     */
    public function confirmAction($profile, $id)
    {
        $this->init($profile);

        return $this->get('templating')->renderResponse(
            $this->getTemplate('confirm'),
            array(
                'id'      => $id,
                'profile' => $profile,
                'form'    => $this
                    ->createFormBuilder($this->get('metadata')->getById($id))
                    ->add('delete', 'submit', array('label' => 'löschen'))
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
        $this->init($profile);

        $form = $this->createFormBuilder($this->get('metadata')->getById($id))
            ->add('delete', 'submit', array('label' => 'löschen'))
            ->getForm()
            ->submit($this->data['request']);

        if ($form->isValid()) {
            $this->get('metadata')->deleteById($id);
            $this->get('session')->getFlashBag()->add('success', 'Erfolgreich gelöscht.');
        } else {
            $this->get('session')->getFlashBag()->add('error', 'Eintrag konnte nicht gelöscht werden.');
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
            $this->data['p']['dateStamp'] = date("Y-m-d");

            $params['id'] = $entity->getId();
            $params['hasAccess'] = !$entity->getReadonly();
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
