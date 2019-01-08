<?php

namespace Plugins\WhereGroup\ManualBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/public/manual")
 */
class ManualController extends Controller
{
    /**
     * @Route("/", name="manual", methods={"GET"})
     */
    public function indexAction()
    {
        return $this->render('@MetadorManual/Manual/index.html.twig');
    }

    /**
     * @Route("/user", name="manual_user", methods={"GET"})
     */
    public function userAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');
        return $this->render('@MetadorManual/Manual/user.html.twig');
    }

    /**
     * @Route("/metadata", name="manual_metadata", methods={"GET"})
     */
    public function metadataAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');
        return $this->render('@MetadorManual/Manual/metadata.html.twig');
    }

    /**
     * @Route("/plugin", name="manual_plugin", methods={"GET"})
     */
    public function pluginAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');
        return $this->render('@MetadorManual/Manual/plugin.html.twig');
    }
}
