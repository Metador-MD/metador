<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

/**
 * Class CastToArrayExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class JsonDecodeExtension extends \Twig_Extension
{
    /**
     * @return array
     */
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('json_decode', array($this, 'decode'))
        );
    }

    /**
     * @param $var
     * @param bool $assoc
     * @return array
     */
    public function decode($var, $assoc = false)
    {
        return json_decode($var, $assoc);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_json_decode";
    }
}
