<?php

namespace Plugins\WhereGroup\ServiceBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\SearchBundle\Component\Paging;

class ProfileController extends Controller
{
    /**
     * @Template("MetadorThemeBundle:Profile:index.html.twig")
     */
    public function indexAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileServiceBundle::form.html.twig")
     */
    public function newAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileServiceBundle::form.html.twig")
     */
    public function useAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileServiceBundle::form.html.twig")
     */
    public function editAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileServiceBundle::confirm.html.twig")
     */
    public function confirmAction($data)
    {
        return $data;
    }
}
