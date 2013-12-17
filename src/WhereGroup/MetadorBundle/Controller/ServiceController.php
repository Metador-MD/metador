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
use WhereGroup\MetadorBundle\Component\MetadorDocument;

/**
 * @Route("/metador/service")
 */
class ServiceController extends MetadorController
{
    /**
     * @Route("/")
     * @Template("WhereGroupMetadorBundle:Service:index.html.twig")
     */
    public function indexAction() {
        $limit = 100;
        $offset = 0;

        $qb = $this->getDoctrine()->getManager()->createQueryBuilder();

        $result = 
            $qb->select('m')
                ->from('WhereGroupMetadorBundle:Metadata','m')
                ->where($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', ':hierarchyLevel')
                ))
                ->orderBy('m.updateTime', 'DESC')
                ->setFirstResult( $offset )
                ->setMaxResults( $limit )
                ->setParameter('hierarchyLevel', 'service')
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
                return $this->redirect($this->generateUrl('wheregroup_metador_service_index'));
            }
        }

        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['form'] . ':Service:form.html.twig',
            array(
                'p' => $p,
                'examples' => $this->getExamples('service')
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
            $conf['templates']['form'] . ':Service:form.html.twig',
            array(
                'p' => $p,
                'examples' => $this->getExamples('service')
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
                return $this->redirect($this->generateUrl('wheregroup_metador_service_index'));
            }
        }

        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['form'] . ':Service:form.html.twig',
            array(
                'id' => $id,
                'p' => $p,
                'examples' => $this->getExamples('service')
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

        return $this->redirect($this->generateUrl('wheregroup_metador_service_index'));
    }


    /**
     * @Route("/coupled")
     * @Method("GET")
     */
    public function coupledAction() {
        $qb = $this->getDoctrine()->getEntityManager()->createQueryBuilder();
        $term = $this->getRequest()->get('find', '');
        $return = array();

        $result = $qb
            ->select('u')
            ->from('WhereGroup\MetadorBundle\Entity\Metadata', 'u')
            ->where($qb->expr()->andx(
                $qb->expr()->orx(
                    $qb->expr()->eq('u.hierarchyLevel', '?1'),
                    $qb->expr()->eq('u.hierarchyLevel', '?2')
                )
                ,$qb->expr()->like('u.title', $qb->expr()->literal('%' . $term . '%')) // 
            ))->setParameters(array(
                1 => 'dataset', 
                2 => 'series'
            ))->getQuery()->getResult();


        foreach ($result as $obj) {
            $return[] = array(
                'label' => $obj->getTitle(),
                'value' => ($obj->getCodespace() != "")
                    ? $obj->getCodespace() . '#' . $obj->getUuid() 
                    : $obj->getUuid()
            );
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');
        $response->setContent(json_encode($return));
        return $response;
    }

}