<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Interface Expression
 * @package WhereGroup\CoreBundle\Component\Search
 */
interface Expression
{

    /**
     * @return mixed
     */
    public function getExpression();

    /**
     * @param $expression
     * @return Expression
     */
    public function setExpression($expression);

    /**
     * @param array $items
     * @return mixed
     */
    public function andx(array $items);

    /**
     * @param array $items
     * @return mixed
     */
    public function orx(array $items);

    /**
     * @param $item
     * @return mixed
     */
    public function not($item);

    /**
     * @param $property
     * @param array $items
     * @return mixed
     */
    public function inx($property, array $items);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function equal($property, $value);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function like($property, $value);
}
