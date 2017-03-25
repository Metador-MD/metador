<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * Class ThemeController
 * @package WhereGroup\CoreBundle\Controller
 * @Route("/theme/")
 */
class ThemeController extends Controller
{
    /**
     * @Route("/", name="metador_theme_index")
     * @Method("GET")
     * @Template("MetadorThemeBundle:Theme:elements.html.twig")
     */
    public function indexAction()
    {
        return array();
    }
}
