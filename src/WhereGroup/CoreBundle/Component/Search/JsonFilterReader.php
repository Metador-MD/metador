<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Class JsonFilterReader
 * @package Plugins\WhereGroup\DevToolsBundle\Component
 * @author Paul Schmidt <panadium@gmx.de>
 */
class JsonFilterReader implements FilterReader
{

    /**
     * @param $filter
     * @param Expression $expression
     */
    public static function read($filter, Expression &$expression)
    {
        $expression->setResultExpression(self::getExpression($filter, $expression));
    }

    /**
     * @param array $filter
     * @param Expression $expression
     * @return array|mixed|null
     */
    private static function getExpression(array $filter, Expression &$expression)
    {
        // property name and property value, ">=2" is for "in".
        if (count($filter) >= 2 && !is_array($filter[0]) && !is_array($filter[1])) {
            return $filter;
        }

        $items = array();
        foreach ($filter as $key => $value) {
            if (is_integer($key)) { // list
                $items[] = self::getExpression($value, $expression);
                continue;
            }

            switch ($key) {
                case 'and':
                    $list = self::getExpression($value, $expression);

                    if (count($list) > 1) {
                        return $expression->andx($list);
                    } elseif (count($list) === 1) {
                        return $list[0];
                    }

                    return null;
                case 'or':
                    $list = self::getExpression($value, $expression);

                    if (count($list) > 1) {
                        return $expression->orx($list);
                    } elseif (count($list) === 1) {
                        return $list[0];
                    }

                    return null;
                case 'not':
                    $item = self::getExpression($value, $expression);

                    return $expression->not($item);
                case 'eq':
                    $property = self::getExpression($value, $expression);

                    return $expression->eq($property[0], $property[1]);
                case 'like':
                    $property = self::getExpression($value, $expression);

                    return $expression->like($property[0], $property[1], '\\', '_', '*');
                case 'notlike':
                case 'notLike':
                    $property = self::getExpression($value, $expression);

                    return $expression->notLike($property[0], $property[1], '\\', '_', '*');
                case 'in':
                    $list = self::getExpression($value, $expression);

                    if (count($list) > 1) {
                        return $expression->in($key, $list);
                    } elseif (count($list) === 1) {
                        return $list[0];
                    }

                    return null;
                // TODO other
                default:
                    return null;
            }
        }

        return $items;
    }
}
