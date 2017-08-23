<?php

namespace WhereGroup\CoreBundle\Component\Search;

use Doctrine\ORM\Query\Expr;

/**
 * Class DatabaseExpression
 * @package Plugins\WhereGroup\DevToolsBundle\Component
 * @author Paul Schmidt <panadium@gmx.de>
 */
class DatabaseExpression implements Expression
{
    /**
     * @var array
     */
    private $replacements;

    /**
     * @var string
     */
    private $alias;

    /**
     * @var array
     */
    private $parameters;

    /**
     * @var Expr
     */
    private $expression;

    /**
     * DatabaseExpression constructor.
     * @param $alias
     */
    public function __construct($alias)
    {
        $this->alias = $alias;
        $this->replacements = array(
            'wildcard' => '%',
            'singlechar' => '_',
            'escapechar' => '\\',
        );
        $this->parameters = array();


    }

    /**
     * @param array $replacements
     */
    public function resetReplacements($replacements)
    {
        $this->replacements = $this->prepareReplacements($replacements);
    }

    /**
     * @param array|null $replacements
     * @return array|null
     */
    private function prepareReplacements(array $replacements = null)
    {
        if ($replacements !== null) {
            $replacements = array_change_key_case($replacements, CASE_LOWER);
            if (!isset($replacements['wildcard'])
                || !isset($replacements['singlechar'])
                || !isset($replacements['escapechar'])) {
                $replacements = null;
            }

            return $replacements;
        } else {
            return null;
        }
    }

    /**
     * @param $name
     * @return string
     */
    private function getName($name)
    {
        return $this->alias.'.'.$name;
    }

    /**
     * @param $property
     * @param $value
     * @return string
     */
    private function addParameter($property, $value)
    {
        $name = $property.count($this->parameters);
        $this->parameters[$name] = $value;

        return ':'.$name;
    }

    /**
     * @param $character
     * @return string
     */
    private function addEscape($character)
    {
        if (strpos('!"#$%&\'()*+,-./:;<=>?@[\]^_`{|}~', $character) !== false) {
            return '\\'.$character;
        } else {
            return $character;
        }
    }

    /**
     * @param $escape
     * @param $character
     * @return string
     */
    private function getRegex($escape, $character)
    {
        $first = $this->addEscape($escape);
        $second = $this->addEscape($character);

        return '/(?<!'.$first.')('.$second.')/';
    }

    /**
     * @param $value
     * @param array $replacements
     * @return bool
     */
    private function replace(&$value, array $replacements)
    {
        if ($replacements !== null && $this->replacements) {
            $escape = $replacements !== null ? $replacements['escapechar'] : null;

            $value = preg_replace(
                $this->getRegex(
                    $escape,
                    $replacements['wildcard']
                ),
                $this->replacements['wildcard'],
                $value
            );

            $value = preg_replace(
                $this->getRegex(
                    $escape,
                    $replacements['singlechar']
                ),
                $this->replacements['singlechar'],
                $value
            );

            $value = preg_replace($this->getRegex($escape, $escape), $this->replacements['singlechar'], $value);

            return true;
        } else {
            return false;
        }
    }

    /**
     * @return Expr
     */
    public function getExpression()
    {
        return $this->expression;
    }

    /**
     * @param $expression
     * @return $this
     */
    public function setExpression($expression)
    {
        $this->expression = $expression;

        return $this;
    }

    /**
     * @return array
     */
    public function getParameters()
    {
        return $this->parameters;
    }

    /**
     * @param $items
     * @return Expr\Andx
     */
    public function getAnd($items)
    {
        return new Expr\Andx($items);
    }

    /**
     * @param $items
     * @return Expr\Orx
     */
    public function getOr($items)
    {
        return new Expr\Orx($items);
    }

    /**
     * @param $item
     * @return Expr\Func
     */
    public function getNot($item)
    {
        $expr = new Expr();

        return $expr->not($item);
    }

    /**
     * @param $property
     * @param $value
     * @return Expr\Comparison
     */
    public function getEqual($property, $value)
    {
        $expr = new Expr();

        return $expr->eq($this->getName($property), $this->addParameter($property, $value));
    }

    /**
     * @param $property
     * @param $value
     * @param array|null $replacements
     * @return Expr\Comparison
     */
    public function getLike($property, $value, array $replacements = null)
    {
        $expr = new Expr();
        $prepared = $this->prepareReplacements($replacements);

        $value_ = $value;
        if ($prepared) {
            $value_ = $this->replace($value_, $prepared);
        } else {
            $value_ = $this->addParameter($property, $value);
        }

        return $expr->like($this->getName($property), $value_);
    }

}
