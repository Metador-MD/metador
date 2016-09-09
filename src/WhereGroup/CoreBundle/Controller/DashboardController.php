<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 * @Route("/")
 */
class DashboardController extends Controller
{
    /**
     * @Route("/dashboard", name="metador_dashboard")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        return array();
    }
}
