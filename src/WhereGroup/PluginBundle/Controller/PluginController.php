<?php

namespace WhereGroup\PluginBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * @Route("/admin/plugin")
 */
class PluginController extends Controller
{
    /**
     * @Route("/", name="metador_admin_plugin")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        return array(
            'plugins' => $this->get('metador_plugin')->getPlugins()
        );
    }

    /**
     * @Route("/update", name="metador_admin_plugin_update")
     * @Method("POST")
     */
    public function updatePluginAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        $this->get('metador_plugin')->update(
            $this->get('request')->request->all(),
            'metador_admin_plugin'
        );
    }
}
