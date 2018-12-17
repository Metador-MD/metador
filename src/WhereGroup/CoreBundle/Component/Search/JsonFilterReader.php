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
     * @param ExprHandler $expressionHandler
     * @return null|Expression
     * @throws PropertyNameNotFoundException
     */
    public static function read($filter, ExprHandler $expressionHandler)
    {
        $parameters = [];

        $expression = self::getExpression($filter, $expressionHandler, $parameters);

        if (is_array($expression) && count($expression) !== 1) {
            return null;
        }

        return new Expression($expression[0], $parameters);
    }

    /**
     * @param array $filter
     * @param ExprHandler $expression
     * @param $parameters
     * @return array|mixed|null
     * @throws PropertyNameNotFoundException
     */
    private static function getExpression(array $filter, ExprHandler $expression, &$parameters)
    {
        $items = [];

        foreach ($filter as $key => $value) {
            if (is_integer($key)) { // list
                $items[] = self::getExpression($value, $expression, $parameters)[0];
                continue;
            }

            switch ($key) {
                case 'and':
                    $list = self::getExpression($value, $expression, $parameters);
                    if (count($list) > 1) {
                        $items[] = $expression->andx($list);
                    } elseif (count($list) === 1) {
                        $items = $list;
                    }
                    break;
                case 'or':
                    $list = self::getExpression($value, $expression, $parameters);
                    if (count($list) > 1) {
                        $items[] = $expression->orx($list);
                    } elseif (count($list) === 1) {
                        $items = $list;
                    }
                    break;
                case 'not':
                    $item = self::getExpression($value, $expression, $parameters);
                    $items[] = $expression->not($item[0]);
                    break;
                case 'eq':
                    $items[] = $expression->eq(key($value), $value[key($value)], $parameters);
                    break;
                case 'neq':
                    $items[] = $expression->neq(key($value), $value[key($value)], $parameters);
                    break;
                case 'like':
                    $items[] = $expression->like(key($value), $value[key($value)], $parameters, '\\', '_', '*');
                    break;
                case 'notlike':
                    $items[] = $expression->notLike(key($value), $value[key($value)], $parameters, '\\', '_', '*');
                    break;
                case 'in':
                    $items[] = $expression->in(key($value), $value[key($value)], $parameters);
                    break;
                case 'between':
                    $items[] = $expression->between(
                        key($value),
                        $value[key($value)]['lower'],
                        $value[key($value)]['upper'],
                        $parameters
                    );
                    break;
                case 'gt':
                case '>':
                    $items[] = $expression->gt(key($value), $value[key($value)], $parameters);
                    break;
                case 'gte':
                case '>=':
                    $items[] = $expression->gte(key($value), $value[key($value)], $parameters);
                    break;
                case 'lt':
                case '<':
                    $items[] = $expression->lt(key($value), $value[key($value)], $parameters);
                    break;
                case 'lte':
                case '<=':
                    $items[] = $expression->lte(key($value), $value[key($value)], $parameters);
                    break;
                case 'bbox':
                    $items[] = $expression->bbox(key($value), $value[key($value)], $parameters);
                    break;
                case 'intersects':
                    $items[] = $expression->intersects(key($value), $value[key($value)], $parameters);
                    break;
                case 'contains':
                    $items[] = $expression->contains(key($value), $value[key($value)], $parameters);
                    break;
                case 'within':
                    $items[] = $expression->within(key($value), $value[key($value)], $parameters);
                    break;
                default:
                    throw new PropertyNameNotFoundException($key);
            }
        }

        return $items;
    }
}
