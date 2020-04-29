<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Twig_Extension;
use Twig_SimpleFilter;

/**
 * Class CastToArrayExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class CastToArrayExtension extends Twig_Extension
{
    /**
     * @return Twig_SimpleFilter[]
     */
    public function getFilters()
    {
        return [
            new Twig_SimpleFilter('cast_to_array', [$this, 'decode'], ['is_safe' => ['html']])
        ];
    }

    /**
     * @param $var
     * @return array
     */
    public function decode($var)
    {
        return (array)$var;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_cast_to_array";
    }
}
