<?php

namespace WhereGroup\SearchBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

use WhereGroup\MetadorBundle\Entity\Metadata;
use WhereGroup\MetadorBundle\Component\MetadorController;
use WhereGroup\SearchBundle\Component\MetadataSearch;
use WhereGroup\SearchBundle\Component\Paging;

/**
 * @Route("/search")
 */
class SearchController extends Controller
{
    /**
     * @Route("/", name="search_index")
     */
    public function indexAction() {
        $conf = $this->container->getParameter('metador');

        return $this->render(
            $conf['templates']['search'] . ':Search:index.html.twig',
            array()
        );      
    }

    /**
     * @Route("/get/", name="search_get")
     */
    public function getAction() {
        $conf = $this->container->getParameter('metador');
        $search = $this->container->get('metadata_search');

        $page = $this->container->get('request')->get('page', 1);

        $result = $search->find(array(
            'page'          => $this->container->get('request')->get('page', 1),
            'limit'         => $this->container->get('request')->get('limit', 5),
            'searchterm'    => $this->container->get('request')->get('searchterm', ''),
            'filter-dataset'=> $this->container->get('request')->get('filter-dataset', 1),
            'filter-service'=> $this->container->get('request')->get('filter-service', 1),
            'filter-series' => $this->container->get('request')->get('filter-series', 1)
        ));

        $html = $this->render(
            $conf['templates']['search'] . ':Search:result.html.twig', $result
        );

        $response = new Response();
        $response->headers->set('ContentType', 'application/json');
        $response->setContent(json_encode(array(
            'paging' => $result['paging'],
            'html' => $html->getContent()
        )));

        return $response;
    }
}