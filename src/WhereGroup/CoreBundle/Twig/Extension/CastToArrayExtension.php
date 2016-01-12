<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;

class CastToArrayExtension extends \Twig_Extension
{
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('cast_to_array', array($this, 'decode'), array('is_safe' => array('html')))
        );
    }

    public function getName()
    {
        return 'cast_to_array_extension';
    }


    public function decode($var)
    {
        return (array)$var;
    }
}
