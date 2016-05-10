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
     * @return string
     */
    public function getName()
    {
        return 'json_decode_extension';
    }

    /**
     * @param $var
     * @return array
     */
    public function decode($var)
    {
        return json_decode($var);
    }
}
