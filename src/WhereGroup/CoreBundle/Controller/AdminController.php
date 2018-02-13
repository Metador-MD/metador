<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\CoreBundle\Component\AjaxResponse;

/**
 * @Route("/admin")
 */
class AdminController extends Controller
{
    /**
     * @Route("/", name="metador_admin_index")
     * @Method("GET")
     */
    public function indexAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        return $this->render("@MetadorCore/Admin/index.html.twig", array(
            'log' => $this->get('metador_healthcheck')->check()
        ));
    }

    /**
     * @Route("/clear/cache", name="metador_admin_clear_cache")
     * @Method("POST")
     */
    public function clearCacheAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $this->get('metador_cache')->truncate();

        return $this->redirectToRoute('metador_admin_index');
    }
}
