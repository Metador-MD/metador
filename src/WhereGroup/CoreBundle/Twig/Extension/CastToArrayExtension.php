<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

/**
 * Class CastToArrayExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class CastToArrayExtension extends \Twig_Extension
{
    /**
     * @return array
     */
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('cast_to_array', array($this, 'decode'), array('is_safe' => array('html')))
        );
    }

    /**
     * @param $var
     * @return array
     */
    public function decode($var)
    {
        return (array)$var;
    }
}
