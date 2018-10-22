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
     * @var array $aliasMap
     */
    protected $aliasMap;

    /**
     * @var string $defaultAlias
     */
    protected $defaultAlias;

    /**
     * @var array $propertyMap
     */
    protected $propertyMap;

    /**
     * @var bool $useMapping
     */
    protected $useMapping;

    /**
     * @var ExprHandler
     */
    protected $exprHandler;

    protected $isCsw;

    /**
     * JsonFilterReader constructor.
     * @param ExprHandler $exprHandler
     */
    private function __construct(ExprHandler $exprHandler, $isCsw = false)
    {
        $this->exprHandler = $exprHandler;
        $this->aliasMap = $exprHandler->getAliasMap();
        $this->defaultAlias = $exprHandler->getDefaultAlias();
        $this->propertyMap = $exprHandler->getPropertyMap();
        $this->isCsw = $isCsw;
    }

    private function findMap($name, $delimiter = '.')
    {
        foreach ($this->aliasMap as $name => $alias) {
            foreach ($this->propertyMap[$name] as $key => $propname) {
                if ($key === $name) {
                    return $alias.$delimiter.$propname;
                }
            }
        }

        throw new PropertyNameNotFoundException($name);
    }

    /**
     * @param $name
     * @param string $delimiter
     * @return string
     * @throws PropertyNameNotFoundException
     */
    private function getName($name, $delimiter = '.')
    {
        if ($this->exprHandler instanceof DatabaseExprHandler) {
            if ($this->isCsw) {
                $splittedName = explode('.', $name);
                $name_ = count($splittedName) === 1 ? $splittedName[0] : $splittedName[1];
                foreach ($this->aliasMap as $entityname => $alias) {
                    foreach ($this->propertyMap[$entityname] as $key => $propname) {
                        if (strtolower($key) === strtolower($name_)) {
                            return $alias.$delimiter.$propname;
                        }
                    }
                }

                return $name;
            } else {
                return $name;
            }



            $splittedName = explode('.', $name);
            if (count($splittedName) === 1) {
                return $this->findMap($name, $delimiter);
            } else {
                $alias = strtolower($splittedName[0]);
                $propertyName =
                    count($splittedName) === 1 ? strtolower($splittedName[0]) : strtolower($splittedName[1]);

                if (!isset($this->aliasMap[$alias]) || !isset($this->propertyMap[$alias][$propertyName])) {
                    throw new PropertyNameNotFoundException($name);
                }

                return $this->aliasMap[$alias].$delimiter.$this->propertyMap[$alias][$propertyName];
            }
        } else {
            if ($this->isCsw) {
                $splittedName = explode('.', $name);

                return $name;
            } else {
                return $name;
            }
        }
    }

    /**
     * @param mixed $filter
     * @param ExprHandler $expression
     * @return null|Expression
     * @throws PropertyNameNotFoundException
     */
    public static function readFromCsw($filter, ExprHandler $expression)
    {
        $parameters = array();
        $reader = new JsonFilterReader($expression, true);
        $expression = $reader->getExpression($filter, $expression, $parameters);

        if (is_array($expression) && count($expression) !== 1) {
            return null;
        } else {
            return new Expression($expression[0], $parameters);
        }
    }

    /**
     * @param mixed $filter
     * @param ExprHandler $expression
     * @return null|Expression
     * @throws PropertyNameNotFoundException
     */
    public static function read($filter, ExprHandler $expression)
    {
        $parameters = array();
        $reader = new JsonFilterReader($expression);
        $expression = $reader->getExpression($filter, $expression, $parameters);

        if (is_array($expression) && count($expression) !== 1) {
            return null;
        } else {
            return new Expression($expression[0], $parameters);
        }
    }

    /**
     * @param array $filter
     * @param ExprHandler $expression
     * @param $parameters
     * @return array|mixed|null
     * @throws PropertyNameNotFoundException
     */
    private function getExpression(array $filter, ExprHandler $expression, &$parameters)
    {
        $items = array();

        foreach ($filter as $key => $value) {
            if (is_integer($key)) { // list
                $items[] = $this->getExpression($value, $expression, $parameters)[0];
                continue;
            }

            switch ($key) {
                case 'and':
                    $list = $this->getExpression($value, $expression, $parameters);
                    if (count($list) > 1) {
                        $items[] = $expression->andx($list);
                    } elseif (count($list) === 1) {
                        $items = $list;
                    }
                    break;
                case 'or':
                    $list = $this->getExpression($value, $expression, $parameters);
                    if (count($list) > 1) {
                        $items[] = $expression->orx($list);
                    } elseif (count($list) === 1) {
                        $items = $list;
                    }
                    break;
                case 'not':
                    $item = $this->getExpression($value, $expression, $parameters);
                    $items[] = $expression->not($item[0]);
                    break;
                case 'eq':
                    $items[] = $expression->eq($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                case 'neq':
                    $items[] = $expression->neq($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                case 'like':
                    $items[] = $expression
                        ->like($this->getName(key($value)), $value[key($value)], $parameters, '\\', '_', '*');
                    break;
                case 'notlike':
                    $items[] = $expression
                        ->notLike($this->getName(key($value)), $value[key($value)], $parameters, '\\', '_', '*');
                    break;
                case 'in':
                    $items[] = $expression->in($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                case 'between':
                    $items[] = $expression->between(
                        $this->getName(key($value)),
                        $value[key($value)]['lower'],
                        $value[key($value)]['upper'],
                        $parameters
                    );
                    break;
                case 'gt':
                case '>':
                    $items[] = $expression->gt($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                case 'gte':
                case '>=':
                    $items[] = $expression->gte($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                case 'lt':
                case '<':
                    $items[] = $expression->lt($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                case 'lte':
                case '<=':
                    $items[] = $expression->lte($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                case 'bbox':
                    $items[] = $expression->bbox($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                case 'intersects':
                    $items[] = $expression->intersects($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                case 'contains':
                    $items[] = $expression->contains($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                case 'within':
                    $items[] = $expression->within($this->getName(key($value)), $value[key($value)], $parameters);
                    break;
                default:
                    throw new PropertyNameNotFoundException($key);
            }
        }

        return $items;
    }
}
