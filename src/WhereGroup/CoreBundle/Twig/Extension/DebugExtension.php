<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;

class DebugExtension extends \Twig_Extension
{
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('debug', array($this, 'debug'), array('is_safe' => array('html')))
        );
    }

    public function getName()
    {
        return 'debug_extension';
    }


    public function debug($var)
    {
        return '<pre>' . htmlspecialchars(print_r($var, true), ENT_QUOTES) . '</pre>';
    }
}
