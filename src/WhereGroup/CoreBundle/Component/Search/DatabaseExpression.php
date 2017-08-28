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
     * @var string
     */
    private $escapeChar = '\\';
    /**
     * @var string
     */
    private $singleChar = '_';
    /**
     * @var string
     */
    private $wildCard = '%';

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
    private $resultExpression;

    /**
     * DatabaseExpression constructor.
     * @param $alias
     */
    public function __construct($alias)
    {
        $this->alias = $alias;
        $this->parameters = array();
    }

    /**
     * @param $escape
     * @param $character
     * @return string
     */
    private static function getRegex($escape, $character)
    {
        $first = self::addEscape($escape);
        $second = self::addEscape($character);

        return '/(?<!'.$first.')('.$second.')/';
    }

    /**
     * @param $character
     * @return string
     */
    private static function addEscape($character)
    {
        if (strpos('!"#$%&\'()*+,-./:;<=>?@[\]^_`{|}~', $character) !== false) {
            return '\\'.$character;
        } else {
            return $character;
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
     * @return Expr
     */
    public function getResultExpression()
    {
        return $this->resultExpression;
    }

    /**
     * @param $expression
     * @return $this
     */
    public function setResultExpression($expression)
    {
        $this->resultExpression = $expression;

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
     * @param array $items
     * @return Expr\Andx
     */
    public function andx(array $items)
    {
        return new Expr\Andx($items);
    }

    /**
     * @param array $items
     * @return Expr\Orx
     */
    public function orx(array $items)
    {
        return new Expr\Orx($items);
    }

    /**
     * @param $item
     * @return Expr\Func
     */
    public function not($item)
    {
        $expr = new Expr();

        return $expr->not($item);
    }

    /**
     * @param $property
     * @param $items
     * @return Expr\Func
     */
    public function in($property, array $items)
    {
        $expr = new Expr();

        return $expr->in($this->getName($property), $this->addParameter($property, $items));
    }

    /**
     * @param $property
     * @param $value
     * @return Expr\Comparison
     */
    public function eq($property, $value)
    {
        $expr = new Expr();

        return $expr->eq($this->getName($property), $this->addParameter($property, $value));
    }

    /**
     * @param $property
     * @param $value
     * @return Expr\Comparison
     */
    public function neq($property, $value)
    {
        $expr = new Expr();

        return $expr->neq($this->getName($property), $this->addParameter($property, $value));
    }

    /**
     * @param $property
     * @param $value
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     * @return Expr\Comparison
     */
    public function like($property, $value, $escapeChar = '\\', $singleChar = '_', $wildCard = '%')
    {
        $expr = new Expr();
        if ($escapeChar === $this->escapeChar && $singleChar === $this->singleChar && $wildCard === $this->wildCard) {
            $valueX = $this->addParameter($property, $value);
        } else {
            $valueX = preg_replace(self::getRegex($escapeChar, $wildCard), $this->wildCard, $value);
            #repalce singleChar
            $valueX = preg_replace(self::getRegex($escapeChar, $singleChar), $this->singleChar, $valueX);
            #repalce escape
            $valueX = preg_replace(self::getRegex($escapeChar, $escapeChar), $this->escapeChar, $valueX);
        }

        return $expr->like($this->getName($property), $valueX);
    }

    /**
     * @param $property
     * @param $value
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     * @return Expr\Comparison
     */
    public function notLike($property, $value, $escapeChar = '\\', $singleChar = '_', $wildCard = '%')
    {
        $expr = new Expr();
        if ($escapeChar === $this->escapeChar && $singleChar === $this->singleChar && $wildCard === $this->wildCard) {
            $valueX = $this->addParameter($property, $value);
        } else {
            $valueX = preg_replace(self::getRegex($escapeChar, $wildCard), $this->wildCard, $value);
            #repalce singleChar
            $valueX = preg_replace(self::getRegex($escapeChar, $singleChar), $this->singleChar, $valueX);
            #repalce escape
            $valueX = preg_replace(self::getRegex($escapeChar, $escapeChar), $this->escapeChar, $valueX);
        }

        return $expr->notLike($this->getName($property), $valueX);
    }

    /**
     * @param $property
     * @param $lower
     * @param $upper
     * @return Expr\Func
     */
    public function between($property, $lower, $upper)
    {
        $expr = new Expr();

        return $expr->between(
            $this->getName($property),
            $this->addParameter($property, $lower),
            $this->addParameter($property, $upper)
        );
    }

    /**
     * @param $property
     * @param $value
     * @return Expr\Comparison
     */
    public function gt($property, $value)
    {
        $expr = new Expr();

        return $expr->gt($this->getName($property), $this->addParameter($property, $value));
    }

    /**
     * @param $property
     * @param $value
     * @return Expr\Comparison
     */
    public function gte($property, $value)
    {
        $expr = new Expr();

        return $expr->gte($this->getName($property), $this->addParameter($property, $value));
    }

    /**
     * @param $property
     * @param $value
     * @return Expr\Comparison
     */
    public function lt($property, $value)
    {
        $expr = new Expr();

        return $expr->lt($this->getName($property), $this->addParameter($property, $value));
    }

    /**
     * @param $property
     * @param $value
     * @return Expr\Comparison
     */
    public function lte($property, $value)
    {
        $expr = new Expr();

        return $expr->lte($this->getName($property), $this->addParameter($property, $value));
    }

    /**
     * @param $property
     * @return string
     */
    public function isNull($property)
    {
        $expr = new Expr();

        return $expr->isNull($this->getName($property));
    }

    /**
     * @param $property
     * @return string
     */
    public function isNotNull($property)
    {
        $expr = new Expr();

        return $expr->isNotNull($this->getName($property));
    }
}
