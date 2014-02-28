<?php

namespace WhereGroup\MetadorBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * @Route("/metador/data")
 */
class DataController extends Controller {
    /**
     * @Route("/")
     * @Template("WhereGroupMetadorBundle:Dataset:index.html.twig")
     */
    public function indexAction() {
        $limit = 100;
        $offset = 0;

        $metadata = $this->get('metador_metadata');

        return array(
            'rows' => $metadata->getDataset($limit, $offset)
        );
    }


    /**
     * @Route("/new")
     * @Method({"GET", "POST"})
     */
    public function newAction() {
        $metadata = $this->get('metador_metadata');
        
        // LOAD
        if ($this->get('request')->getMethod() == 'GET')
            $p = array('dateStamp' => date("Y-m-d"));

        // SAVE
        else
            if(($p = $this->getRequest()->request->get('p', false)) && $metadata->saveObject($p))
                return $this->redirect($this->generateUrl('wheregroup_metador_data_index'));

        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['form'] . ':Dataset:form.html.twig',
            array(
                'p' => $p,
                'examples' => $this->getExample(),
                'hasAccess' => true
            )
        );
    }


    /**
     * @Route("/use/{id}")
     * @Method({"GET"})
     */
    public function useAction($id) {
        $metadata = $this->get('metador_metadata');
        $data = $metadata->getById($id);
        
        if(($p = $data->getObject())) {
            $p['dateStamp'] = date("Y-m-d");
            unset($p['fileIdentifier'], $p['identifier']);
        }
        
        // Load Template.
        $conf = $this->container->getParameter('metador');
        

        return $this->render(
            $conf['templates']['form'] . ':Dataset:form.html.twig',
            array(
                'p' => $p,
                'examples' => $this->getExample(),
                'hasAccess' => true
            )
        );
    }

    /**
     * @Route("/edit/{id}")
     * @Method({"GET", "POST"})
     */
    public function editAction($id) {
        $metadata = $this->get('metador_metadata');
        $data = $metadata->getById($id);

        // LOAD
        if ($this->get('request')->getMethod() == 'GET') {
            if(($p = $data->getObject())) {
                $p['dateStamp'] = date("Y-m-d");
            }

        // SAVE
        } else {
            if(($p = $this->getRequest()->request->get('p', false)) && $metadata->saveObject($p, $id)) {
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
                'examples' => $this->getExample(),
                'hasAccess' => !$data->getReadonly()
            )
        );
    }

    /**
     * @Route("/delete/{id}")
     * @Method("POST")
     */
    public function deleteAction($id) {
        $metadata = $this->get('metador_metadata');
        $metadata->deleteById($id);

        return $this->redirect($this->generateUrl('wheregroup_metador_data_index'));
    }

    private function getExample() {
        $wizard = $this->container->get('metador_wizard');

        return $wizard->getExamples('dataset');
    }

}