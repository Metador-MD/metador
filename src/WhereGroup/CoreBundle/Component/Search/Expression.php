<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Interface Expression
 * @package WhereGroup\CoreBundle\Component\Search
 */
interface Expression
{

    const EXCAPECHAR = 'escapechar';
    const SINGLECHAR = 'singlechar';
    const WILDCARD = 'wildcard';

    /**
     * @return mixed
     */
    public function getResultExpression();

    /**
     * @param $expression
     * @return Expression
     */
    public function setResultExpression($expression);

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
    public function notequal($property, $value);

    /**
     * @param $property
     * @param $value
     * @param array|null $replacements-
     * e.g. array(self::WILDCARD => '%',self::SINGLECHAR => '_',self::EXCAPECHAR => '\\')
     * @return mixed
     */
    public function like($property, $value, array $replacements = null);
}
