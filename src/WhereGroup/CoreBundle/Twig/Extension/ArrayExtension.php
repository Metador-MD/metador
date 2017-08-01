<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use WhereGroup\CoreBundle\Component\Utils\ArrayParser;

/**
 * Class ArrayExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class ArrayExtension extends \Twig_Extension
{
    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('array_get', array($this, 'get')),
            new \Twig_SimpleFunction('array_is_empty', array($this, 'isEmpty')),
            new \Twig_SimpleFunction('array_length', array($this, 'length')),
            new \Twig_SimpleFunction('array_exists', array($this, 'exists'))
        );
    }

    /**
     * @param array $array
     * @param $path
     * @param null $default
     * @return array|null
     */
    public function get(array $array, $path, $default = null)
    {
        return ArrayParser::get($array, $path, $default);
    }

    /**
     * @param $array
     * @param $path
     * @return bool
     */
    public function isEmpty(array $array, $path)
    {
        return ArrayParser::isEmpty($array, $path);
    }

    /**
     * @param $array
     * @param $path
     * @return array|int|null
     */
    public function length(array $array, $path)
    {
        return ArrayParser::length($array, $path);
    }

    /**
     * @param $array
     * @param $path
     * @param null $find
     * @return bool
     */
    public function exists(array $array, $path, $find = null)
    {
        return ArrayParser::exists($array, $path, $find);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_array";
    }
}
