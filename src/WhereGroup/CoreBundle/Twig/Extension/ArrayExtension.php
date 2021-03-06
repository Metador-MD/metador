<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Twig_Extension;
use Twig_SimpleFunction;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;

/**
 * Class ArrayExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class ArrayExtension extends Twig_Extension
{
    /**
     * @return array
     */
    public function getFunctions()
    {
        return [
            new Twig_SimpleFunction('array_get', [$this, 'get']),
            new Twig_SimpleFunction('array_is_empty', [$this, 'isEmpty']),
            new Twig_SimpleFunction('array_to_string', [$this, 'toString']),
            new Twig_SimpleFunction('array_length', [$this, 'length']),
            new Twig_SimpleFunction('array_exists', [$this, 'exists']),
            new Twig_SimpleFunction('array_all_exists', [$this, 'allExists']),
            new Twig_SimpleFunction('array_one_exists', [$this, 'oneExists']),
            new Twig_SimpleFunction('array_has_value', [$this, 'arrayHasValue']),
            new Twig_SimpleFunction('array_to_string', [$this, 'arrayToString']),
        ];
    }

    /**
     * @param $array
     * @param $path
     * @param null $default
     * @param bool $reindex
     * @return array|null
     */
    public function get($array, $path, $default = null, $reindex = false)
    {
        if (!is_array($array)) {
            return null;
        }

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
     * @return string
     */
    public function toString(array $array)
    {

        return implode(", ", $array);
    }

    /**
     * @param array $array
     * @param $path
     * @param null $default
     * @param bool $reindex
     * @return array|int|null
     */
    public function length(array $array, $path, $default = null, $reindex = false)
    {
        return ArrayParser::length($array, $path, $default, $reindex);
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
     * @param array $array
     * @param array $paths
     * @param null $find
     * @param bool $reindex
     * @return bool
     */
    public function oneExists(array $array, array $paths, $find = null, $reindex = false)
    {
        foreach ($paths as $path) {
            if (!ArrayParser::isEmpty($array, $path, $reindex)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param $array
     * @return bool
     */
    public function arrayHasValue($array)
    {
        $option = false;
        if (is_array($array)) {
            array_walk_recursive($array, function ($item, $key) use (&$option) {
                if ($item !== "") {
                    $option = true;
                    return;
                }
            });
            return $option;
        } else {
            return !empty($array);
        }
    }

    /**
     * @param $array
     * @return string
     */
    public function arrayToString($array)
    {
        if (is_array($array)) {
            return implode("", $array);
        }

        return $array;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_array";
    }
}
