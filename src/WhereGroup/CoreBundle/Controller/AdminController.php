<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * @Route("/admin")
 */
class AdminController extends Controller
{
    /**
     * @Route("/", name="metador_admin_index")
     * @Method("GET")
     * @Template("WhereGroupThemeBundle:Template:admin.html.twig")
     */
    public function indexAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        return array();
    }
}
