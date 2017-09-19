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
     * @param mixed $filter
     * @param ExprHandler $expression
     * @return null|Expression
     */
    public static function read($filter, ExprHandler $expression)
    {
        $parameters = array();
        $expression = self::getExpression($filter, $expression, $parameters);
        if (is_array($expression) && count($expression) === 0) {
            return null;
        } else {
            return new Expression($expression, $parameters);
        }
    }

    /**
     * @param array $filter
     * @param ExprHandler $expression
     * @return array|mixed|null
     */
    private static function getExpression(array $filter, ExprHandler $expression, &$parameters)
    {
        // property name and property value, ">=2" is for "in".
        if (count($filter) >= 2 && !is_array($filter[0]) && !is_array($filter[1])) {
            return $filter;
        }

        $items = array();
        foreach ($filter as $key => $value) {
            if (is_integer($key)) { // list
                $items[] = self::getExpression($value, $expression, $parameters);
                continue;
            }

            switch ($key) {
                case 'and':
                    $list = self::getExpression($value, $expression, $parameters);

                    if (count($list) > 1) {
                        return $expression->andx($list);
                    } elseif (count($list) === 1) {
                        return $list[0];
                    }

                    return null;
                case 'or':
                    $list = self::getExpression($value, $expression, $parameters);

                    if (count($list) > 1) {
                        return $expression->orx($list);
                    } elseif (count($list) === 1) {
                        return $list[0];
                    }

                    return null;
                case 'not':
                    $item = self::getExpression($value, $expression, $parameters);

                    return $expression->not($item);
                case 'eq':
                    foreach ($value as $name => $val) {
                        return $expression->eq($name, $val, $parameters);
                    }

                    return null;
                case 'like':
                    $property = self::getExpression($value, $expression, $parameters);

                    return $expression->like($property[0], $property[1], $parameters, '\\', '_', '*');
                case 'notlike':
                    $property = self::getExpression($value, $expression, $parameters);

                    return $expression->notLike($property[0], $property[1], $parameters, '\\', '_', '*');
                case 'in':
                    $list = self::getExpression($value, $expression, $parameters);

                    if (count($list) > 1) {
                        return $expression->in($key, $list, $parameters);
                    } elseif (count($list) === 1) {
                        return $list[0];
                    }

                    return null;
                case 'between':
                    foreach ($value as $name => $val) {
                        return $expression->between($name, $val['lower'], $val['upper'], $parameters);
                    }

                    return null;
                case 'gt':
                case '>':
                    foreach ($value as $name => $val) {
                        return $expression->gt($name, $val, $parameters);
                    }

                    return null;
                case 'gte':
                case '>=':
                    foreach ($value as $name => $val) {
                        return $expression->gte($name, $val, $parameters);
                    }

                    return null;
                case 'lt':
                case '<':
                    foreach ($value as $name => $val) {
                        return $expression->lt($name, $val, $parameters);
                    }

                    return null;
                case 'lte':
                case '<=':
                    foreach ($value as $name => $val) {
                        return $expression->lte($name, $val, $parameters);
                    }

                    return null;
                case 'bbox':
                    foreach ($value as $name => $val) {
                        return $expression->bbox($name, $val, $parameters);
                    }

                    return null;
                case 'intersects':
                    foreach ($value as $name => $val) {
                        return $expression->intersects($name, $val, $parameters);
                    }

                    return null;
                case 'contains':
                    foreach ($value as $name => $val) {
                        return $expression->contains($name, $val, $parameters);
                    }

                    return null;
                case 'within':
                    foreach ($value as $name => $val) {
                        return $expression->within($name, $val, $parameters);
                    }

                    return null;
                default:
                    return null;
            }
        }

        return $items;
    }
}
