<?php

namespace WhereGroup\MetadorBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\SearchBundle\Component\Paging;

/**
 * TODO: remove me
 * @Route("/metador/data")
 */
class DataController extends Controller
{
    /**
     * @Route("/")
     */
    public function indexAction()
    {
        $page     = $this->get('request')->get('page', 1);
        $metadata = $this->get('metador_metadata');
        $conf     = $this->container->getParameter('metador');
        $limit    = $conf['hits'];
        $paging   = new Paging($metadata->getDatasetCount(), $limit, $page);

        return $this->render(
            $conf['templates']['form'] . ':Dataset:index.html.twig',
            array(
                'rows' => $metadata->getDataset($limit, ($page * $limit) - $limit),
                'paging' => $paging->calculate()
            )
        );
    }

    /**
     * @Route("/new")
     * @Method({"GET", "POST"})
     */
    public function newAction()
    {
        $metadata = $this->get('metador_metadata');

        // LOAD
        if ($this->get('request')->getMethod() == 'GET') {
            $p = array('dateStamp' => date("Y-m-d"));

        // SAVE
        } elseif (($p = $this->getRequest()->request->get('p', false)) && $metadata->saveObject($p)) {
            return $this->redirect($this->generateUrl('metadata_index'));
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
     * @Route("/use/{id}")
     * @Method({"GET"})
     */
    public function useAction($id)
    {
        $metadata = $this->get('metador_metadata');
        $data = $metadata->getById($id);

        if (($p = $data->getObject())) {
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
    public function editAction($id)
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
                return $this->redirect($this->generateUrl('metadata_index'));
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
    public function deleteAction($id)
    {
        $metadata = $this->get('metador_metadata');
        $metadata->deleteById($id);

        return $this->redirect($this->generateUrl('metadata_index'));
    }

    private function getExample()
    {
        $wizard = $this->container->get('metador_wizard');

        return $wizard->getExamples('dataset');
    }
}
