<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Interface ExprHandler
 * @package WhereGroup\CoreBundle\Component\Search
 */
interface ExprHandler
{
    /**
     * @param array $propertyMap
     * @return mixed
     */
    public function setPropertyMap(array $propertyMap);

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
     * @param $parameters
     * @return mixed
     */
    public function in($property, array $items, &$parameters);

    /**
     * @param $property
     * @param $value
     * @param $parameters
     * @return mixed
     */
    public function eq($property, $value, &$parameters);

    /**
     * @param $property
     * @param $value
     * @param $parameters
     * @return mixed
     */
    public function neq($property, $value, &$parameters);

    /**
     * @param $property
     * @param $value
     * @param $parameters
     * @param $escapeChar
     * @param $singleChar
     * @param $wildCard
     * @return mixed
     */
    public function like($property, $value, &$parameters, $escapeChar, $singleChar, $wildCard);

    /**
     * @param $property
     * @param $value
     * @param $parameters
     * @param $escapeChar
     * @param $singleChar
     * @param $wildCard
     * @return mixed
     */
    public function notLike($property, $value, &$parameters, $escapeChar, $singleChar, $wildCard);

    /**
     * @param $property
     * @param $lower
     * @param $upper
     * @param $parameters
     * @return mixed
     */
    public function between($property, $lower, $upper, &$parameters);

    /**
     * @param $property
     * @param $value
     * @return mixed
     */
    public function gt($property, $value, &$parameters);

    /**
     * @param $property
     * @param $value
     * @param $parameters
     * @return mixed
     */
    public function gte($property, $value, &$parameters);

    /**
     * @param $property
     * @param $value
     * @param $parameters
     * @return mixed
     */
    public function lt($property, $value, &$parameters);

    /**
     * @param $property
     * @param $value
     * @param $parameters
     * @return mixed
     */
    public function lte($property, $value, &$parameters);

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
     * @param $parameters
     * @return mixed
     */
    public function bbox($property, array $bbox, &$parameters);

    /**
     * @param $property
     * @param $geoFeature
     * @param $parameters
     * @return mixed
     */
    public function intersects($property, $geoFeature, &$parameters);

    /**
     * @param $property
     * @param $geoFeature
     * @param $parameters
     * @return mixed
     */
    public function contains($property, $geoFeature, &$parameters);

    /**
     * @param $property
     * @param $geoFeature
     * @param $parameters
     * @return mixed
     */
    public function within($property, $geoFeature, &$parameters);
}
