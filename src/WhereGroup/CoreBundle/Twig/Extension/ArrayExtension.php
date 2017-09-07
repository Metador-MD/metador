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
            new \Twig_SimpleFunction('array_exists', array($this, 'exists')),
            new \Twig_SimpleFunction('array_all_exists', array($this, 'allExists')),
        );
    }

    /**
     * @param array $array
     * @param $path
     * @param null $default
     * @param bool $reindex
     * @return array|null
     */
    public function get(array $array, $path, $default = null, $reindex = false)
    {
        return ArrayParser::get($array, $path, $default, $reindex);
    }

    /**
     * @param array $array
     * @param $path
     * @param bool $reindex
     * @return bool
     */
    public function isEmpty(array $array, $path, $reindex = false)
    {
        return ArrayParser::isEmpty($array, $path, $reindex);
    }

    /**
     * @param array $array
     * @param $path
     * @param null $default
     * @return array|int|null
     */
    public function length(array $array, $path, $default = null)
    {
        return ArrayParser::length($array, $path, $default);
    }

    /**
     * @param array $array
     * @param $path
     * @param null $find
     * @param bool $reindex
     * @return bool
     */
    public function exists(array $array, $path, $find = null, $reindex = false)
    {
        return ArrayParser::exists($array, $path, $find, $reindex);
    }

    /**
     * @param array $array
     * @param array $paths
     * @param null $find
     * @param bool $reindex
     * @return bool
     */
    public function allExists(array $array, array $paths, $find = null, $reindex = false)
    {
        foreach ($paths as $path) {
            if (!$this->exists($array, $path, $find, $reindex)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_array";
    }
}
