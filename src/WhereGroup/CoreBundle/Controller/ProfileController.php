<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 * @Route("/metadata")
 */
class ProfileController extends Controller
{
    /**
     * @Route("/{profile}/index", name="metadata_index")
     * @Method("GET")
     */
    public function indexAction($profile, Request $request)
    {
        $metadata = $this->get('metadata')->getMetadata(
            20,
            $request->get('page', 1),
            $profile
        );

        $className = $this->get('metador_plugin')->getPluginClassName($profile);

        return $this->forward($className . ':Profile:index', array(
            'data' => array(
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
    public function newAction($profile, Request $request)
    {
        // LOAD
        if ($request->getMethod() == 'GET') {
            $p = array('dateStamp' => date("Y-m-d"));

        // SAVE
        } elseif (($p = $request->request->get('p', false))
            && $this->get('metadata')->saveObject($p)) {
            return $this->redirectToRoute('metadata_index', array('profile' => $profile));
        }

        $className = $this->get('metador_plugin')->getPluginClassName($profile);

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
    public function editAction($profile, $id, Request $request)
    {
        $metadata = $this->get('metadata');
        $data = $metadata->getById($id);

        // LOAD
        if ($request->getMethod() == 'GET') {
            if (($p = $data->getObject())) {
                $p['dateStamp'] = date("Y-m-d");
            }

        // SAVE
        } else {
            if (($p = $request->request->get('p', false)) && $metadata->saveObject($p, $id)) {
                return $this->redirect($this->generateUrl('metadata_index', array('profile' => $profile)));
            }
        }

        $className = $this->get('metador_plugin')->getPluginClassName($profile);

        return $this->forward($className . ':Profile:edit', array(
            'data' => array(
                'profile'   => $profile,
                'id'        => $id,
                'p'         => $p,
                'examples'  => $this->getExample($profile),
                'hasAccess' => !$data->getReadonly()
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
        return $this->forward($this->getClassName($profile) . ':Profile:confirm', array(
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
    public function deleteAction($profile, $id, Request $request)
    {
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

    private function getExample($profile)
    {
        $className = $this->get('metador_plugin')->getPluginClassName($profile);

        $path = $this
            ->get('kernel')
            ->locateResource('@' . $className . '/Resources/config/wizard/');

        return $this->container->get('metador_wizard')->getExamples($path);
    }
}
