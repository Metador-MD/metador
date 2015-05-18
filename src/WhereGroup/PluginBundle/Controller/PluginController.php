<?php

namespace WhereGroup\PluginBundle\Controller;

use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * Class PluginController
 * @package WhereGroup\PluginBundle\Controller
 * @author A.R.Pour
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
     * @Template()
     */
    public function updateAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        return array(
            'plugins' => $this->get('request')->request->all()
        );
        // $this->get('metador_plugin')->update(
        //     $this->get('request')->request->all(),
        //     'metador_admin_plugin'
        // );

        // return $this->redirect($this->generateUrl('metador_admin_plugin'));
    }

    /**
     * @Route("/view/{plugin}", name="metador_admin_plugin_view")
     * @Method("GET")
     */
    public function viewAction($plugin)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        return $this->forward($plugin . ':Plugin:view');
    }

    /**
     * @Route("/command/config", name="metador_admin_plugin_command_config")
     * @Method("POST")
     */
    public function configAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->update(
                $this->get('request')->request->all()
            )
        );
    }

    /**
     * @Route("/command/assets", name="metador_admin_plugin_command_assets")
     * @Method("POST")
     */
    public function assetsAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->assetsInstall()
        );
    }

    /**
     * @Route("/command/database", name="metador_admin_plugin_command_database")
     * @Method("POST")
     */
    public function databaseAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->doctrineUpdate()
        );
    }

    /**
     * @Route("/command/cache", name="metador_admin_plugin_command_cache")
     * @Method("POST")
     */
    public function cacheAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->clearCache()
        );
    }
}
