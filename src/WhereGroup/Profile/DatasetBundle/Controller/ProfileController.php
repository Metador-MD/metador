<?php

namespace WhereGroup\Profile\DatasetBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\SearchBundle\Component\Paging;

class ProfileController extends Controller
{
    /**
     * @Template()
     */
    public function indexAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle:Profile:form.html.twig")
     */
    public function newAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle:Profile:form.html.twig")
     */
    public function useAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle:Profile:form.html.twig")
     */
    public function editAction($data)
    {
        return $data;
    }

    public function xmlAction($data)
    {
        $xml = $this->render("ProfileDatasetBundle:Profile:metadata.xml.twig", array(
            "p" => $data['p']
        ));

        $response = new Response();
        $response->headers->set('Content-Type', 'text/xml');
        $response->setContent($xml->getContent());

        return $response;
    }
}
