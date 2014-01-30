<?php

namespace WhereGroup\MetadorBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

use WhereGroup\MetadorBundle\Event\MetadataChangeEvent;
use WhereGroup\MetadorBundle\Entity\Metadata;
use WhereGroup\MetadorBundle\Entity\Address;
use WhereGroup\MetadorBundle\Component\MetadorController;

/**
 * @Route("/metador/data")
 */
class DataController extends MetadorController
{
    /**
     * @Route("/")
     * @Template("WhereGroupMetadorBundle:Dataset:index.html.twig")
     */
    public function indexAction() {
        $limit = 100;
        $offset = 0;

        return array(
            'rows' => $this->getDataset($limit, $offset)
        );
    }


    /**
     * @Route("/new")
     * @Method({"GET", "POST"})
     */
    public function newAction() {
        // LOAD
        if ($this->get('request')->getMethod() == 'GET')
            $p = array('dateStamp' => date("Y-m-d"));

        // SAVE
        else
            if(($p = $this->getRequest()->request->get('p', false)) && $this->saveMetadata($p))
                return $this->redirect($this->generateUrl('wheregroup_metador_data_index'));

        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['form'] . ':Dataset:form.html.twig',
            array(
                'p' => $p,
                'examples' => $this->getExamples('dataset'),
                'hasAccess' => true
            )
        );
    }


    /**
     * @Route("/use/{id}")
     * @Method({"GET"})
     */
    public function useAction($id) {
        $metadata = $this->loadMetadata($id);
        
        if(($p = $metadata->getObject())) {
            $p['dateStamp'] = date("Y-m-d");
            unset($p['fileIdentifier'], $p['identifier']);
        }
        
        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['form'] . ':Dataset:form.html.twig',
            array(
                'p' => $p,
                'examples' => $this->getExamples('dataset'),
                'hasAccess' => true
            )
        );
    }

    /**
     * @Route("/edit/{id}")
     * @Method({"GET", "POST"})
     */
    public function editAction($id) {
        $metadata = $this->loadMetadata($id);

        // LOAD
        if ($this->get('request')->getMethod() == 'GET') {
            if(($p = $metadata->getObject())) {
                $p['dateStamp'] = date("Y-m-d");
            }

        // SAVE
        } else {
            if(($p = $this->getRequest()->request->get('p', false)) && $this->saveMetadata($p, $id)) {
                return $this->redirect($this->generateUrl('wheregroup_metador_data_index'));
            }
        }

        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['form'] . ':Dataset:form.html.twig',
            array(
                'id' => $id,
                'p' => $p,
                'examples' => $this->getExamples('dataset'),
                'hasAccess' => $metadata->getReadonly() ? 0 : 1
            )
        );
    }

    /**
     * @Route("/delete/{id}")
     * @Method("POST")
     */
    public function deleteAction($id) {
        $this->deleteMetadata($id);

        return $this->redirect($this->generateUrl('wheregroup_metador_data_index'));
    }

}