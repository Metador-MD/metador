<?php
/**
 * metador2
 * Created by PhpStorm.
 * User: Paul Schmidt
 * Date: 05.09.17 16:03
 */

namespace WhereGroup\CoreBundle\Component\Search;


class Expression
{
    private $expression;
    private $parameters;

    /**
     * Expression constructor.
     * @param $expression
     * @param $parameters
     */
    public function __construct($expression, $parameters)
    {
        $this->expression = $expression;
        $this->parameters = $parameters;
    }


    /**
     * @return mixed
     */
    public function getExpression()
    {
        return $this->expression;
    }

    /**
     * @return mixed
     */
    public function getParameters()
    {
        return $this->parameters;
    }
}