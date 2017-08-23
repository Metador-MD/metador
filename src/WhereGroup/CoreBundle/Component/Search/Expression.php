<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Interface Expression
 * @package WhereGroup\CoreBundle\Component\Search
 */
interface Expression
{
    /**
     * @param $expression
     * @return mixed
     */
    public function setExpression($expression);

    /**
     * @param $items
     * @return mixed
     */
    public function getAnd($items);

    /**
     * @param $items
     * @return mixed
     */
    public function getOr($items);

    /**
     * @param $item
     * @return mixed
     */
    public function getNot($item);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function getEqual($property, $value);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function getLike($property, $value);
}
