<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\SearchBundle\Component\Paging;

/**
 * @Route("/metadata")
 */
class MetadataController extends Controller
{
    /**
     * @Route("/{profile}/index", name="metadata_index")
     * @Method("GET")
     */
    public function indexAction($profile)
    {
        $metadata = $this->get('metador_metadata')->getMetadata(
            20,
            $this->get('request')->get('page', 1),
            $profile
        );

        return $this->forward('Profile' . ucfirst($profile) . 'Bundle:Profile:index', array(
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
    public function newAction($profile)
    {
        // LOAD
        if ($this->get('request')->getMethod() == 'GET') {
            $p = array('dateStamp' => date("Y-m-d"));

        // SAVE
        } elseif (($p = $this->getRequest()->request->get('p', false))
            && $this->get('metador_metadata')->saveObject($p)) {
            return $this->redirect(
                $this->generateUrl('metadata_index', array('profile' => $profile))
            );
        }

        return $this->forward('Profile' . ucfirst($profile) . 'Bundle:Profile:new', array(
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
        $data = $this->get('metador_metadata')->getById($id);

        if (($p = $data->getObject())) {
            $p['dateStamp'] = date("Y-m-d");
            unset($p['fileIdentifier'], $p['identifier']);
        }

        return $this->forward('Profile' . ucfirst($profile) . 'Bundle:Profile:use', array(
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
        $metadata = $this->get('metador_metadata');
        $data = $metadata->getById($id);

        // LOAD
        if ($this->get('request')->getMethod() == 'GET') {
            if (($p = $data->getObject())) {
                $p['dateStamp'] = date("Y-m-d");
            }

        // SAVE
        } else {
            if (($p = $this->getRequest()->request->get('p', false)) && $metadata->saveObject($p, $id)) {
                return $this->redirect($this->generateUrl('metadata_index', array('profile' => $profile)));
            }
        }

        return $this->forward('Profile' . ucfirst($profile) . 'Bundle:Profile:edit', array(
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
        return $this->forward('Profile' . ucfirst($profile) . 'Bundle:Profile:confirm', array(
            'data' => array(
                'id'      => $id,
                'profile' => $profile,
                'form'    => $this->createFormBuilder($this->get('metador_metadata')->getById($id))
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
        $form = $this->createFormBuilder($this->get('metador_metadata')->getById($id))
            ->add('delete', 'submit', array('label' => 'löschen'))
            ->getForm()
            ->submit($this->get('request'));

        if ($form->isValid()) {
            $this->get('metador_metadata')->deleteById($id);

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

        return $this->redirect($this->generateUrl('metadata_index', array('profile' => $profile)));
    }

    private function getExample($profile)
    {
        try {
            $path = $this->container
                ->get('kernel')
                ->locateResource('@Profile' . ucfirst($profile) . 'Bundle/Resources/config/wizard/');

        } catch (\Exception $e) {
            // TODO: MESSAGE;
            return array();
        }

        return $this->container->get('metador_wizard')->getExamples($path);
    }
}
