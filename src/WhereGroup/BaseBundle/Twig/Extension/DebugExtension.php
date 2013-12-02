<?php

namespace WhereGroup\BaseBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;

class DebugExtension extends \Twig_Extension
{
    public function getFilters()
    {
        return array(
            'debug' => new \Twig_Filter_Method($this, 'debug', array('is_safe' => array('html')))
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
