<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\SearchBundle\Component\Paging;

/**
 * @Route("/metador")
 */
class DashboardController extends Controller
{
    /**
     * @Route("/", name="metador_dashboard")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        return array(
            'address' => $this->get('metador_address')->get()
        );
    }
}
