<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use WhereGroup\CoreBundle\Component\MetadorException;
use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\CoreBundle\Component\Finder;
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
     * @Route("/{profile}/index", name="metadata_index")
     * @Method("GET")
     */
    public function indexAction($profile)
    {
        $this->init($profile);

        $params = $this->data['request']->query->all();

        $filter = new Finder();
        $filter->page = isset($params['page']) ? $params['page'] : 1;
        $filter->hits = isset($params['hits']) ? $params['hits'] : 10;
        $filter->terms = isset($params['terms']) ? $params['terms'] : '';
        $filter->profile = $profile;

        $filter->public = true;

        if ($this->get('security.authorization_checker')->isGranted('ROLE_SYSTEM_GEO_OFFICE')) {
            $filter->geoOffice = true;
            $filter->public = null;
        }

        /** @var UsernamePasswordToken $token */
        $token = $this->get('security.token_storage')->getToken();

        /** @var User $user */
        $user = $token->getUser();

        if (is_object($user)) {
            $filter->userId = $user->getId();
            $filter->public = null;
        }

        $metadata = $this->get('metadata')->find($filter);

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

        try {
            $metadata = $this->get('metadata')->saveObject($this->data['p']);
        } catch (MetadorException $e) {
            $this->get('metador_logger')->flashError($e->getMessage());
            return $this->renderResponse($profile, 'form');
        }

        return $this->redirectToRoute('metadata_edit', array(
            'profile' => $profile,
            'id'      => $metadata->getId()
        ));
    }

    /**
     * @Route("/{profile}/coupled/", name="metadata_coupled")
     * @Method("GET")
     */
    public function coupledAction($profile)
    {
        $data = array();

        $filter = new Finder();
        $filter->hierarchyLevel = array('series', 'dataset');
        $filter->profile = 'profile-dataset';

        $title = $this->get('request_stack')->getCurrentRequest()->get('title');
        if (!empty($title)) {
            $filter->title = $title;
        }
        unset($title);

        $metadata = $this->get('metadata')->find($filter);

        /** @var Metadata $obj */
        foreach ($metadata['result'] as $obj) {
            $data[] = array(
                'label' => $obj->getTitle(),
                'value' => ($obj->getCodespace() != "")
                    ? $obj->getCodespace() . '#' . $obj->getUuid()
                    : $obj->getUuid()
            );
        }

        return new JsonResponse($data);
    }

    /**
     * @Route("/{profile}/edit/{id}", name="metadata_edit")
     * @Method("GET")
     */
    public function editAction($profile, $id)
    {
        $metadata = $this->get('metadata')->getById($id);

        $this->denyAccessUnlessGranted('view', $metadata);

        $this->init($profile);

        return $this->renderResponse($profile, 'form', $metadata);
    }

    /**
     * @Route("/{profile}/update/{id}", name="metadata_update")
     * @Method("POST")
     */
    public function updateAction($profile, $id)
    {
        $metadata = $this->get('metadata')->getById($id);

        $this->denyAccessUnlessGranted(array('view', 'edit'), $metadata);

        $this->init($profile);

        try {
            $metadata = $this->get('metadata')->saveObject($this->data['p'], $id);
        } catch (MetadorException $e) {
            $this->get('metador_logger')->flashError($e->getMessage());
            $this->redirectToRoute('metadata_edit', array('profile' => $profile, 'id' => $id));
        }

        return $this->renderResponse($profile, 'form', $metadata);
    }

    /**
     * @Route("/{profile}/use/{id}", name="metadata_use")
     * @Method({"GET"})
     */
    public function useAction($profile, $id)
    {
        $metadata = $this->get('metadata')->getById($id);

        $this->denyAccessUnlessGranted('view', $metadata);

        $this->init($profile);

        $this->data['p'] = $metadata->getObject();
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
        $metadata = $this->get('metadata')->getById($id);

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
        $metadata = $this->get('metadata')->getById($id);

        $this->denyAccessUnlessGranted(array('view', 'edit'), $metadata);

        $this->init($profile);

        $form = $this->createFormBuilder($metadata)
            ->add('delete', 'submit', array('label' => 'ok'))
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
