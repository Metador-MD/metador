<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

/**
 * Class DebugExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class DebugExtension extends \Twig_Extension
{
    /**
     * @return array
     */
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('debug', array($this, 'debug'), array('is_safe' => array('html')))
        );
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'debug_extension';
    }

    /**
     * @param $var
     * @return string
     */
    public function debug($var)
    {
        return '<pre>' . htmlspecialchars(print_r($var, true), ENT_QUOTES) . '</pre>';
    }
}
