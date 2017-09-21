<?php

namespace WhereGroup\CoreBundle\Component\Search;

use Doctrine\ORM\Query\Expr;

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
     * @param Expr $item
     * @return mixed
     */
    public function not($item);

    /**
     * @param string $property
     * @param array $items
     * @param array $parameters
     * @return mixed
     */
    public function in($property, array $items, &$parameters);

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     */
    public function eq($property, $value, &$parameters);

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     */
    public function neq($property, $value, &$parameters);

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     * @return mixed
     */
    public function like($property, $value, &$parameters, $escapeChar, $singleChar, $wildCard);

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     * @return mixed
     */
    public function notLike($property, $value, &$parameters, $escapeChar, $singleChar, $wildCard);

    /**
     * @param string $property
     * @param mixed $lower
     * @param mixed $upper
     * @param array $parameters
     * @return mixed
     */
    public function between($property, $lower, $upper, &$parameters);

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     */
    public function gt($property, $value, &$parameters);

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     */
    public function gte($property, $value, &$parameters);

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     */
    public function lt($property, $value, &$parameters);

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     */
    public function lte($property, $value, &$parameters);

    /**
     * @param string $property
     * @return mixed
     */
    public function isNull($property);

    /**
     * @param string $property
     * @return mixed
     */
    public function isNotNull($property);

    /**** geo spatial ****/

    /**
     * @param string $propertyNameName
     * @param array $geoFeature GeoJSON or an array(w,s,e,n)
     * @param array $parameters
     * @return mixed
     */
    public function bbox($propertyNameName, $geoFeature, &$parameters);

    /**
     * @param string  $propertyName property name
     * @param string|array $geoFeature property name or GeoJson
     * @param array $parameters
     * @return mixed
     */
    public function intersects($propertyName, $geoFeature, &$parameters);

    /**
     * @param string $propertyName property name
     * @param string|array $geoFeature property name or GeoJson
     * @param array $parameters
     * @return mixed
     */
    public function contains($propertyName, $geoFeature, &$parameters);

    /**
     * @param string $propertyName property name
     * @param string|array $geoFeature property name or GeoJson
     * @param array $parameters
     * @return mixed
     */
    public function within($propertyName, $geoFeature, &$parameters);
}
