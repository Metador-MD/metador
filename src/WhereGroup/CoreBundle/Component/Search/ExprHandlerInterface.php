<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Interface ExprHandlerInterface
 * @package WhereGroup\CoreBundle\Component\Search
 */
interface ExprHandlerInterface
{
    /**
     * @param array $propertyMap
     * @return mixed
     */
    public function setPropertyMap(array $propertyMap);

    /**
     * @param array $items
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function andx(array $items);

    /**
     * @param array $items
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function orx(array $items);

    /**
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function not($item);

    /**
     * @param string $propertyName
     * @param array $items
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function in($propertyName, array $items, &$parameters);

    /**
     * @param string $propertyName
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function eq($propertyName, $value, &$parameters);

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function neq($property, $value, &$parameters);

    /**
     * @param string $propertyName
     * @param mixed $value
     * @param array $parameters
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function like($propertyName, $value, &$parameters, $escapeChar, $singleChar, $wildCard);

    /**
     * @param string $propertyName
     * @param mixed $value
     * @param array $parameters
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function notLike($propertyName, $value, &$parameters, $escapeChar, $singleChar, $wildCard);

    /**
     * @param string $propertyName
     * @param mixed $lower
     * @param mixed $upper
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function between($propertyName, $lower, $upper, &$parameters);

    /**
     * @param string $propertyName
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function gt($propertyName, $value, &$parameters);

    /**
     * @param string $propertyName
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function gte($propertyName, $value, &$parameters);

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function lt($property, $value, &$parameters);

    /**
     * @param string $propertyName
     * @param mixed $value
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function lte($propertyName, $value, &$parameters);

    /**
     * @param string $property
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function isNull($property);

    /**
     * @param string $propertyName
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function isNotNull($propertyName);

    /**** geo spatial ****/

    /**
     * @param string $propertyName
     * @param array $geoFeature GeoJSON or an array(w,s,e,n)
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function bbox($propertyName, $geoFeature, &$parameters);

    /**
     * @param string  $propertyName property name
     * @param string|array $geoFeature property name or GeoJson
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function intersects($propertyName, $geoFeature, &$parameters);

    /**
     * @param string $propertyName property name
     * @param string|array $geoFeature property name or GeoJson
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function contains($propertyName, $geoFeature, &$parameters);

    /**
     * @param string $propertyName property name
     * @param string|array $geoFeature property name or GeoJson
     * @param array $parameters
     * @return mixed
     * @throws PropertyNameNotFoundException
     */
    public function within($propertyName, $geoFeature, &$parameters);
}
