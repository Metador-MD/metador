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

        $result = $search->find();

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