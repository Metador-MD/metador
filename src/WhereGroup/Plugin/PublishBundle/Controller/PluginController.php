<?php

namespace WhereGroup\Plugin\PublishBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class PluginController extends Controller
{
    /**
     * @Template()
     */
    public function viewAction()
    {
        return array();
    }
}