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
 * @Route("/metador/service")
 */
class ServiceController extends Controller
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
        $paging   = new Paging($metadata->getServiceCount(), $limit, $page);

        return $this->render(
            $conf['templates']['form'] . ':Service:index.html.twig',
            array(
                'rows'   => $metadata->getService($limit, ($page * $limit) - $limit),
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
            return $this->redirect($this->generateUrl('wheregroup_metador_service_index'));
        }

        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['form'] . ':Service:form.html.twig',
            array(
                'p'         => $p,
                'examples'  => $this->getExample(),
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
            $conf['templates']['form'] . ':Service:form.html.twig',
            array(
                'p'         => $p,
                'examples'  => $this->getExample(),
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
        if ($this->get('request')->getMethod() == 'GET' && ($p = $data->getObject())) {
            $p['dateStamp'] = date("Y-m-d");

        // SAVE
        } elseif (($p = $this->getRequest()->request->get('p', false)) && $metadata->saveObject($p, $id)) {
            return $this->redirect($this->generateUrl('wheregroup_metador_service_index'));

        }

        // Load Template.
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['form'] . ':Service:form.html.twig',
            array(
                'id'        => $id,
                'p'         => $p,
                'examples'  => $this->getExample(),
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

        return $this->redirect($this->generateUrl('wheregroup_metador_service_index'));
    }


    /**
     * @Route("/coupled")
     * @Method("GET")
     */
    public function coupledAction()
    {
        $qb = $this->getDoctrine()->getManager()->createQueryBuilder();
        $term = $this->getRequest()->get('find', '');
        $return = array();

        $result = $qb
            ->select('u')
            ->from('WhereGroup\MetadorBundle\Entity\Metadata', 'u')
            ->where($qb->expr()->andx(
                $qb->expr()->orx(
                    $qb->expr()->eq('u.hierarchyLevel', '?1'),
                    $qb->expr()->eq('u.hierarchyLevel', '?2')
                ),
                $qb->expr()->like('u.title', $qb->expr()->literal('%' . $term . '%')) //
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

    private function getExample()
    {
        $wizard = $this->container->get('metador_wizard');

        return $wizard->getExamples('service');
    }
}
