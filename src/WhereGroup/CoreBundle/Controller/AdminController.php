<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/admin")
 */
class AdminController extends Controller
{
    /**
     * @Route("/", name="metador_admin_index", methods={"GET"})
     */
    public function indexAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        return $this->render("@MetadorCore/Admin/index.html.twig");
    }

    /**
     * @Route("/health", name="metador_admin_health", methods={"GET"})
     */
    public function healthCheckAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $event = $this->get('metador_healthcheck')->check();

        return $this->render("@MetadorCore/Admin/health.html.twig", [
            'hasError'   => $event->hasError(),
            'errorCount' => $event->getErrorCount(),
            'logs'       => $event->getLogs()
        ]);
    }

    /**
     * @Route("/clear/cache", name="metador_admin_clear_cache", methods={"POST"})
     */
    public function clearCacheAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $this->get('metador_cache')->truncate();

        return $this->redirectToRoute('metador_admin_index');
    }
}
