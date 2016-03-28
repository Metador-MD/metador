<?php

namespace Plugins\WhereGroup\DatasetBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * Class ProfileController
 * @package Plugins\WhereGroup\DatasetBundle\Controller
 */
class ProfileController extends Controller
{
    /**
     * @Template("WhereGroupThemeBundle:Profile:index.html.twig")
     */
    public function indexAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle::form.html.twig")
     */
    public function newAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle::form.html.twig")
     */
    public function useAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle::form.html.twig")
     */
    public function editAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle::confirm.html.twig")
     */
    public function confirmAction($data)
    {
        return $data;
    }
}
