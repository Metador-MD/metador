<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;


/**
 * @Route("/")
 */
class HomeController extends Controller
{
    /**
     * @Route("/", name="metador_home")
     * @Method("GET")
     * @Template("MetadorThemeBundle:Home:index.html.twig")
     */
    public function indexAction()
    {
        $params = $this->get('request_stack')->getCurrentRequest()->query->all();

        $metadata = $this->get('metadata')->find(array(
            $params
        ));

        return array(
            'rows'    => $metadata['result'],
            'paging'  => $metadata['paging']
        );
    }
}
