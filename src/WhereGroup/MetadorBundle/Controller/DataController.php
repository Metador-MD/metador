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
use WhereGroup\MetadorBundle\Component\Metador;
use WhereGroup\MetadorBundle\Component\MetadorDocument;

/**
 * @Route("/metador/data")
 */
class DataController extends Metador
{
    /**
     * @Route("/")
     * @Template("WhereGroupMetadorBundle:Data:index.html.twig")
     */
    public function indexAction() {
        $limit = 100;
        $offset = 0;

        $em = $this->getDoctrine()->getManager();
        $qb = $em->createQueryBuilder();

        $result = $em->createQueryBuilder('m')->select('m')
                ->from('WhereGroupMetadorBundle:Metadata','m')
                ->where($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', '?1'),
                    $qb->expr()->eq('m.hierarchyLevel', '?2')
                ))
                ->orderBy('m.updateTime', 'DESC')
                ->setFirstResult( $offset )
                ->setMaxResults( $limit )
                ->setParameters(array(
                    1 => 'dataset',
                    2 => 'series',
                ))
                ->getQuery()
                ->getResult();

        return array('rows' => $result);       
    }


    /**
     * @Route("/new")
     * @Method({"GET", "POST"})
     */
    public function newAction() {
        // LOAD
        if ($this->get('request')->getMethod() == 'GET') {
            $p = array('dateStamp' => date("Y-m-d"));

        // SAVE
        } else {
            if(($p = $this->getRequest()->request->get('p', false)) && $this->saveMetadata($p)) {
                return $this->redirect($this->generateUrl('wheregroup_metador_data_index'));
            }
        }


        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['form'] . ':Data:form.html.twig',
            array(
                'p' => $p,
                'examples' => $this->getExamples('dataset')
            )
        );
    }


    /**
     * @Route("/use/{id}")
     * @Method({"GET"})
     */
    public function useAction($id) {
        if(($p = $this->loadMetadata($id))) {
            $p['dateStamp'] = date("Y-m-d");
            unset($p['fileIdentifier'], $p['identifier']);
        }
        
        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['form'] . ':Data:form.html.twig',
            array(
                'p' => $p,
                'examples' => $this->getExamples('dataset')
            )
        );
    }

    /**
     * @Route("/edit/{id}")
     * @Method({"GET", "POST"})
     */
    public function editAction($id) {
        // LOAD
        if ($this->get('request')->getMethod() == 'GET') {
            if(($p = $this->loadMetadata($id))) {
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
            $conf['templates']['form'] . ':Data:form.html.twig',
            array(
                'id' => $id,
                'p' => $p,
                'examples' => $this->getExamples('dataset')
            )
        );
    }

    /**
     * @Route("/delete/{id}")
     * @Method("POST")
     */
    public function deleteAction($id) {
        if($this->deleteMetadata($id)) {
            $this->get('session')->getFlashBag()->add('success', 'Datensatz gelöscht.');
        } else {
            $this->get('session')->getFlashBag()->add('error', 'Datensatz nicht gefunden.');
        }

        return $this->redirect($this->generateUrl('wheregroup_metador_data_index'));
    }

}