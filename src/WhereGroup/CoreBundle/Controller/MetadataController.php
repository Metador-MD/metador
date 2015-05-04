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
        $page     = $this->get('request')->get('page', 1);
        $conf     = $this->container->getParameter('metador');
        $limit    = $conf['hits'];
        $paging   = new Paging(
            $this->get('metador_metadata')->getMetadataCount($profile),
            $limit,
            $page
        );

        return $this->forward('Profile' . ucfirst($profile) . 'Bundle:Profile:index', array(
            'data' => array(
                'profile' => $profile,
                'rows'    => $this->get('metador_metadata')->getMetadata(
                    $limit,
                    ($page * $limit) - $limit,
                    $profile
                ),
                'paging'  => $paging->calculate()
            )
        ));
    }

    /**
     * @Route("/{profile}/new", name="metadata_new")
     * @Method({"GET", "POST"})
     */
    public function newAction($profile)
    {
        $metadata = $this->get('metador_metadata');

        // LOAD
        if ($this->get('request')->getMethod() == 'GET') {
            $p = array('dateStamp' => date("Y-m-d"));

        // SAVE
        } elseif (($p = $this->getRequest()->request->get('p', false)) && $metadata->saveObject($p)) {
            return $this->redirect($this->generateUrl('metadata_index', array('profile' => $profile)));
        }

        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->forward('Profile' . ucfirst($profile) . 'Bundle:Profile:new', array(
            'data' => array(
                'profile'   => $profile,
                'p'         => $p,
                'examples'  => $this->getExample(),
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
        $metadata = $this->get('metador_metadata');
        $data = $metadata->getById($id);

        if (($p = $data->getObject())) {
            $p['dateStamp'] = date("Y-m-d");
            unset($p['fileIdentifier'], $p['identifier']);
        }

        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->forward('Profile' . ucfirst($profile) . 'Bundle:Profile:use', array(
            'data' => array(
                'profile'   => $profile,
                'p'         => $p,
                'examples'  => $this->getExample(),
                'hasAccess' => true
            )
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
                'examples'  => $this->getExample(),
                'hasAccess' => !$data->getReadonly()
            )
        ));
    }

    /**
     * @Route("/{profile}/delete/{id}", name="metadata_delete")
     * @Method("POST")
     */
    public function deleteAction($profile, $id)
    {
        $metadata = $this->get('metador_metadata');
        $metadata->deleteById($id);

        return $this->redirect($this->generateUrl('metadata_index', array('profile' => $profile)));
    }

    private function getExample()
    {
        $wizard = $this->container->get('metador_wizard');

        return $wizard->getExamples('dataset');
    }
}
