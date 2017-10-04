<?php

namespace WhereGroup\CoreBundle\Component\Utils;

/**
 * Class ArrayParser
 * @package WhereGroup\CoreBundle\Component\Utils
 */
class ArrayParser
{
    /**
     * @param array $array
     * @param $path
     * @param null $default
     * @param bool $reindex
     * @return array|null
     */
    public static function get(array $array, $path, $default = null, $reindex = false)
    {
        if (empty($path) || trim($path) === "") {
            return $array;
        }

        return self::arrayGet($array, self::explodePath($path), $default, $reindex);
    }

    /**
     * @param array $array
     * @param $path
     * @param $value
     * @return mixed
     */
    public static function set(array &$array, $path, $value)
    {
        self::arraySet($array, self::explodePath($path), $value);

        return $value;
    }

    /**
     * @param array $array
     * @param $path
     * @return bool
     */
    public static function delete(array &$array, $path)
    {
        return self::arrayDelete($array, self::explodePath($path));
    }

    /**
     * @param $array
     * @param $path
     * @param bool $reindex
     * @return bool
     */
    public static function isEmpty($array, $path, $reindex = false)
    {
        return empty(self::get($array, $path, null, $reindex));
    }

    /**
     * @param array $array
     * @param $path
     * @param null $default
     * @return array|int|null
     */
    public static function length(array $array, $path, $default = null)
    {
        $item = self::get($array, $path, $default);

        if (is_array($item) || is_object($item)) {
            return count((array)$item);
        }

        if (is_string($item)) {
            return (int)strlen($item);
        }

        if (is_numeric($item)) {
            return (int)$item;
        }

        return null;
    }

    /**
     * @param $array
     * @param $path
     * @param null $find
     * @param bool $reindex
     * @return bool
     */
    public static function exists($array, $path, $find = null, $reindex = false)
    {
        $result = self::get($array, $path, null, $reindex);

        if (!is_null($result) && is_null($find)) {
            return true;
        }

        if ((is_array($result) && in_array($find, $result))
            || (is_array($result) && isset($result[$find]))
            || (is_string($result) && strstr($result, $find) !== false)) {
            return true;
        }

        return false;
    }

    /**
     * @param array $array
     * @param $path
     * @param $value
     * @param bool $reindex
     * @return mixed
     */
    public static function append(array &$array, $path, $value, $reindex = false)
    {
        $item = self::get($array, $path, null, $reindex);

        if ($item === null) {
            $item = $value;
        } elseif (is_array($item)) {
            $item[] = $value;
        } else {
            $item .= $value;
        }

        return self::set($array, $path, $item);
    }

    /**
     * @param array $array1
     * @param array $array2
     * @return array
     */
    public static function merge(array $array1, array $array2)
    {
        foreach ($array2 as $key => $val) {
            if (array_key_exists($key, $array1) && is_array($val)) {
                $array1[$key] = self::merge($array1[$key], $array2[$key]);
                continue;
            }

            $array1[$key] = $val;
        }

        return $array1;
    }

    /**
     * @param $array
     * @param $keys
     * @param null $default
     * @param bool $reindex
     * @return null
     */
    private static function arrayGet($array, $keys, $default = null, $reindex = false)
    {
        $key = array_shift($keys);

        if (isset($array[$key]) && count($keys) === 0) {
            return $array[$key];
        } elseif (isset($array[$key]) && count($keys) >= 1) {
            // Reindex array keys
            if ($reindex) {
                self::reindexKeys($array[$key]);
            }

            return self::arrayGet($array[$key], $keys);
        }

        return $default;
    }

    /**
     * @param array $array
     */
    public static function reindexKeys(array &$array)
    {
        if (is_array($array) && !self::hasStringKeys($array)) {
            $array = array_values($array);
        }
    }

    /**
     * @param array $array
     * @return bool
     */
    private static function hasStringKeys(array $array)
    {
        return count(array_filter(array_keys($array), 'is_string')) > 0;
    }


    /**
     * @param array $array
     * @param $keys
     * @param $value
     * @return mixed
     */
    private static function arraySet(array &$array, $keys, $value)
    {
        $key = array_shift($keys);

        if (count($keys) == 0) {
            $array[$key] = $value;

            return $value;
        }

        if (count($keys) > 0) {
            if (!isset($array[$key])) {
                $array[$key] = array();
            }

            self::arraySet($array[$key], $keys, $value);
        }
    }

    /**
     * @param array $array
     * @param $keys
     * @return bool
     */
    private static function arrayDelete(array &$array, $keys)
    {
        $key = array_shift($keys);

        if (isset($array[$key]) && count($keys) == 0) {
            unset($array[$key]);
            return true;
        }

        if (isset($array[$key]) && count($keys) > 0) {
            return self::arrayDelete($array[$key], $keys);
        }

        return false;
    }

    /**
     * @param $path
     * @return array
     */
    private static function explodePath($path)
    {
        return explode(':', trim($path, ':'));
    }
}
