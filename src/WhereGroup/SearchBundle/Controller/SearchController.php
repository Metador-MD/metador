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

/**
 * @Route("/search")
 */
class SearchController extends MetadorController
{
    /**
     * @Route("/", name="search")
     */
    public function indexAction() {

        return $this->render(
            $conf['templates']['search'] . ':Search:index.html.twig',
            array()
        );      
    }

    /**
     * @Route("/get/", name="search")
     */
    public function getAction() {
        $conf = $this->container->getParameter('metador');

        $search = new MetadataSearch($this->container);

        $result = $search->find(array(
            'page' => $this->get('request')->get('page', 1),
            'limit' => $this->get('request')->get('limit', 4),
            'searchterm' => $this->get('request')->get('find', '')
        ));

       for($i=0,$iL=count($result['result']); $i<$iL; $i++)
            $result['result'][$i]->setReadonly(
                $this->userHasAccess($result['result'][$i]) ? 0 : 1
            );
        
        return $this->render(
            $conf['templates']['search'] . ':Search:result.html.twig',
            array(
                'find' => $result['find'],
                'limit' => $result['limit'],
                'result' => $result['result'],
                'paging' => $result['paging']
            )
        );
    }
}