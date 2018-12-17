<?php

namespace WhereGroup\CoreBundle\Component;

use WhereGroup\CoreBundle\Component\Utils\ArrayParser;

/**
 * Class XmlParserFunctions
 * @package WhereGroup\CoreBundle\Component
 * @author A. R. Pour
 * @codingStandardsIgnoreStart
 */
class XmlParserFunctions
{
    /**
     * @param $methods
     * @param $data
     * @param null $args
     * @return mixed
     */
    public function get($methods, $data, $args = null)
    {
        if (is_string($methods)) {
            $methods = [$methods];
        }

        foreach ($methods as $method) {
            if (method_exists($this, $method)) {
                $data = call_user_func('self::' . $method, $data, $args);
            }
        }

        return $data;
    }

    /**
     * @param $data
     * @param null $args
     * @return mixed
     */
    protected function _removeEmptyValues($data, $args = null)
    {
        ArrayParser::clearEmptyValues($data);
        return $data;
    }

    /**
     * @param $data
     * @param null $args
     * @return array
     */
    protected function _replaceKey($data, $args = null)
    {
        $array = [];

        foreach ($data as $key => $val) {
            if ($key === '#KEY#') {
                return $val;
            }

            if (is_array($val)) {
                $newKey = $this->_replaceKey($val);

                if ($newKey && !is_array($newKey)) {
                    unset($val['#KEY#']);
                    $array[$newKey] = $val;
                }
            }
        }

        return $array;
    }

    /**
     * @param $data
     * @param null $args
     * @return bool
     */
    protected function _boolean($data, $args = null)
    {
        return empty($data) ? false : true;
    }

    /**
     * @param $data
     * @param null $args
     * @return string
     */
    protected function _asText($data, $args = null)
    {
        return is_array($data) ? trim(implode(" ", $data)) : $data;
    }

    /**
     * @param $data
     * @param null $args
     * @return array
     */
    protected function _asArray($data, $args = null)
    {
        return is_array($data) ? $data : array($data);
    }

    /**
     * @param $data
     * @param null $args
     */
    protected function _debug($data, $args = null)
    {
        echo '<pre>' . print_r($data, 1) . '</pre>';
        die('<pre>' . print_r($args, 1) . '</pre>');
    }

    /**
     * @param $data
     * @param null $args
     * @return string
     */
    protected function _commaSeparated($data, $args = null)
    {
        return is_array($data) ? implode(", ", $data) : $data;
    }

    /**
     * @param $data
     * @param null $args
     * @return mixed
     */
    protected function _replace($data, $args = null)
    {
        return str_replace($args[0], $args[1], $data);
    }

    /**
     * Returns first param
     * @param  null $data
     * @param  array $args
     * @return string
     */
    protected function _string($data, $args = null)
    {
        return $args[0];
    }

    /**
     * @param  null $data
     * @param  array $args
     * @return string
     */
    protected function _date($data, $args = null)
    {
        return date(
            $args[0],
            isset($args[1]) ? $args[1] : time()
        );
    }
    /** @codingStandardsIgnoreEnd */
}
