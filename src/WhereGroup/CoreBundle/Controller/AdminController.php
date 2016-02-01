<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

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
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        return array();
    }
}
