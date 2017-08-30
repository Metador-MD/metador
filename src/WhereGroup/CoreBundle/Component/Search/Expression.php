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
    public function in($property, array $items);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function eq($property, $value);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function neq($property, $value);

    /**
     * @param $property
     * @param $value
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     * @return mixed
     */
    public function like($property, $value, $escapeChar, $singleChar, $wildCard);

    /**
     * @param $property
     * @param $value
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     * @return mixed
     */
    public function notLike($property, $value, $escapeChar, $singleChar, $wildCard);

    /**
     * @param $property
     * @param $lower
     * @param $upper
     * @return mixed
     */
    public function between($property, $lower, $upper);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function gt($property, $value);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function gte($property, $value);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function lt($property, $value);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function lte($property, $value);

    /**
     * @param $property
     * @return mixed
     */
    public function isNull($property);

    /**
     * @param $property
     * @return mixed
     */
    public function isNotNull($property);

    /**** geo spatial ****/

    /**
     * @param $property
     * @param array $bbox
     * @return mixed
     */
    public function bbox($property, array $bbox);

    /**
     * @param $property
     * @param $geoFeature
     * @return mixed
     */
    public function intersects($property, $geoFeature);

    /**
     * Checks if $geom is completely inside $property
     * @param $property
     * @param $geoFeature
     * @return mixed
     */
    public function contains($property, $geoFeature);

    /**
     * Checks if $property is completely inside $geom
     * @param $property
     * @param $geoFeature
     * @return mixed
     */
    public function within($property, $geoFeature);
}
