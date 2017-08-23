<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Class JsonFilterReader
 * @package Plugins\WhereGroup\DevToolsBundle\Component
 * @author Paul Schmidt <panadium@gmx.de>
 */
class JsonFilterReader
{

    /**
     * @param array $filter
     * @param Expression $expression
     */
    public static function read(array $filter, Expression $expression)
    {
        $expression->setExpression(self::getExpression($filter, $expression));
    }

    /**
     * @param array $filter
     * @param Expression $expression
     * @return array|mixed|null
     */
    private static function getExpression(array $filter, Expression $expression)
    {
        // property name and property value
        if (count($filter) === 2 && !is_array($filter[0]) && !is_array($filter[1])) {
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
                        return $expression->getAnd($list);
                    } elseif (count($list) === 1) {
                        return $list[0];
                    }

                    return null;
                case 'or':
                    $list = self::getExpression($value, $expression);

                    if (count($list) > 1) {
                        return $expression->getOr($list);
                    } elseif (count($list) === 1) {
                        return $list[0];
                    }

                    return null;
                case 'not':
                    $item = self::getExpression($value, $expression);

                    return $expression->getNot($item);
                case 'equal':
                    $property = self::getExpression($value, $expression);

                    return $expression->getEqual($property[0], $property[1]);
                case 'like':
                    $property = self::getExpression($value, $expression);

                    return $expression->getLike($property[0], $property[1]);
                default:
                    return null;
            }
        }

        return $items;
    }
}
