<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
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
    /**
     * @Route("/{profile}/find", name="metadata_find")
     * @Method("GET")
     * @Template("MetadorThemeBundle:Profile:result.html.twig")
     */
    public function findAction($profile) {
        $params = $this->get('request_stack')->getCurrentRequest()->query->all();

        $params['profile'] = $profile;

        $metadata = $this->get('metadata')->find(array(
            $params
        ));

        return array(
            'profile' => $profile,
            'rows'    => $metadata['result'],
            'paging'  => $metadata['paging']
        );
    }

    /**
     * @Route("/{profile}/index", name="metadata_index")
     * @Method("GET")
     */
    public function indexAction($profile)
    {
        $params = $this->get('request_stack')->getCurrentRequest()->query->all();
        $params['profile'] = $profile;
        $params['page'] = isset($params['page']) ? $params['page'] : 1;
        $params['hits'] = isset($params['hits']) ? $params['hits'] : 10;

        $metadata = $this->get('metadata')->find($params);

        return $this->forward($this->get('metador_plugin')->getPluginClassName($profile) . ':Profile:index', array(
            'data' => array(
                'params'  => $params,
                'profile' => $profile,
                'rows'    => $metadata['result'],
                'paging'  => $metadata['paging']
            )
        ));
    }

    /**
     * @Route("/{profile}/new", name="metadata_new")
     * @Method({"GET", "POST"})
     */
    public function newAction($profile)
    {
        $request = $this->get('request_stack')->getCurrentRequest();
        $p = $request->request->get('p', array());
        $p['dateStamp'] = date("Y-m-d");


        $className = $this->get('metador_plugin')->getPluginClassName($profile);

        // SAVE
        if ($request->getMethod() == 'POST') {
            /** @var Metadata $data */
            $data = $this->get('metadata')->saveObject($p);


            return $this->forward($className . ':Profile:edit', array(
                'data' => array(
                    'profile'   => $profile,
                    'id'        => $data->getId(),
                    'p'         => $p,
                    'examples'  => $this->getExample($profile),
                    'hasAccess' => !$data->getReadonly(),
                    'groups'    => $data->getGroups(),
                    'public'    => $data->getPublic()
                ),
                'id' => $data->getId()
            ));
        }


        return $this->forward($className . ':Profile:new', array(
            'data' => array(
                'profile'   => $profile,
                'p'         => $p,
                'examples'  => $this->getExample($profile),
                'hasAccess' => true
            )
        ));
    }

    /**
     * @Route("/{profile}/use/{id}", name="metadata_use")
     * @Method({"GET"})
     */
    public function useAction($profile, $id)
    {
        $data = $this->get('metadata')->getById($id);

        if (($p = $data->getObject())) {
            $p['dateStamp'] = date("Y-m-d");
            unset($p['fileIdentifier'], $p['identifier']);
        }

        $className = $this->get('metador_plugin')->getPluginClassName($profile);

        return $this->forward($className . ':Profile:use', array(
            'data' => array(
                'profile'   => $profile,
                'p'         => $p,
                'examples'  => $this->getExample($profile),
                'hasAccess' => true
            ),
            'id' => $id
        ));
    }

    /**
     * @Route("/{profile}/edit/{id}", name="metadata_edit")
     * @Method({"GET", "POST"})
     */
    public function editAction($profile, $id)
    {
        $request = $this->get('request_stack')->getCurrentRequest();
        $metadata = $this->get('metadata');
        $data = $metadata->getById($id);
        $p = $data->getObject();
        $p['dateStamp'] = date("Y-m-d");

        // SAVE
        if ($request->getMethod() == 'POST') {
            $p = $request->request->get('p', false);
            $metadata->saveObject($p, $id);
        }

        $className = $this->get('metador_plugin')->getPluginClassName($profile);

        return $this->forward($className . ':Profile:edit', array(
            'data' => array(
                'profile'   => $profile,
                'id'        => $id,
                'p'         => $p,
                'examples'  => $this->getExample($profile),
                'hasAccess' => !$data->getReadonly(),
                'groups'    => $data->getGroups(),
                'public'    => $data->getPublic()
            ),
            'id' => $id
        ));
    }

    /**
     * @Route("/{profile}/confirm/{id}", name="metadata_confirm")
     * @Method("GET")
     */
    public function confirmAction($profile, $id)
    {
        $className = $this->get('metador_plugin')->getPluginClassName($profile);

        return $this->forward($className . ':Profile:confirm', array(
            'data' => array(
                'id'      => $id,
                'profile' => $profile,
                'form'    => $this->createFormBuilder($this->get('metadata')->getById($id))
                    ->add('delete', 'submit', array('label' => 'löschen'))
                    ->getForm()
                    ->createView(),
            ),
            'id' => $id
        ));
    }

    /**
     * @Route("/{profile}/delete/{id}", name="metadata_delete")
     * @Method("POST")
     */
    public function deleteAction($profile, $id)
    {
        $request = $this->get('request_stack')->getCurrentRequest();
        $form = $this->createFormBuilder($this->get('metadata')->getById($id))
            ->add('delete', 'submit', array('label' => 'löschen'))
            ->getForm()
            ->submit($request);

        if ($form->isValid()) {
            $this->get('metadata')->deleteById($id);

            $this->get('session')->getFlashBag()->add(
                'success',
                'Erfolgreich gelöscht.'
            );
        } else {
            $this->get('session')->getFlashBag()->add(
                'error',
                'Eintrag konnte nicht gelöscht werden.'
            );
        }

        return $this->redirectToRoute('metadata_index', array('profile' => $profile));
    }

    /**
     * @param $profile
     * @return array
     */
    private function getExample($profile)
    {
        $className = $this->get('metador_plugin')->getPluginClassName($profile);

        $path = $this
            ->get('kernel')
            ->locateResource('@' . $className . '/Resources/config/wizard/');

        return $this->container->get('metador_wizard')->getExamples($path);
    }
}
