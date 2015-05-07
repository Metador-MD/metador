<?php

namespace WhereGroup\ThemeBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * @Route("/theme")
 */
class ThemeController extends Controller
{
    /**
     * @Route("/", name="metador_theme_index")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        return array();
    }
}
