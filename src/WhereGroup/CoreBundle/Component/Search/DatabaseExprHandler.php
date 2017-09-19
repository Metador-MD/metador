<?php

namespace WhereGroup\CoreBundle\Component\Search;

use Doctrine\ORM\Query\Expr;

/**
 * Class DatabaseExprHandler
 * @package Plugins\WhereGroup\DevToolsBundle\Component
 * @author Paul Schmidt <panadium@gmx.de>
 */
class DatabaseExprHandler implements ExprHandler
{

    /**
     * @var string
     */
    private $escapeChar;
    /**
     * @var string
     */
    private $singleChar;
    /**
     * @var string
     */
    private $wildCard;

    /**
     * @var string
     */
    private $alias;

    /**
     * @var array|string
     */
    private $spatialProperty;

    /**
     * @var array
     */
    private $propertyMap;

    /**
     * DatabaseExprHandler constructor.
     * @param string $alias
     * @param  array|string $spatialProperty
     * array: names of ordinate columns - array(w,s,e,n)
     * string: geometry column name
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     */
    public function __construct(
        $alias,
        $spatialProperty = array('bboxw', 'bboxs', 'bboxe', 'bboxn'),
        $escapeChar = '\\',
        $singleChar = '_',
        $wildCard = '%'
    ) {
        $this->alias = $alias;
        $this->spatialProperty = $spatialProperty;
        $this->escapeChar = $escapeChar;
        $this->singleChar = $singleChar;
        $this->wildCard = $wildCard;
        $this->propertyMap = array();
    }

    /**
     * @param array $propertyMap
     * @return mixed
     */
    public function setPropertyMap(array $propertyMap)
    {
        $this->propertyMap = $propertyMap;
    }

    /**
     * @param string $name
     * @return string
     */
    private function getName($name)
    {
        return $this->alias.'.'.$name;
    }

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return string
     */
    private static function addParameter($property, $value, &$parameters)
    {
        $name = $property.count($parameters);
        $parameters[$name] = $value;

        return ':'.$name;
    }

    /**
     * @param string $escape
     * @param string $character
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
     * @param Expr $item
     * @return Expr\Func
     */
    public function not($item)
    {
        $expr = new Expr();

        return $expr->not($item);
    }

    /**
     * @param string $property
     * @param array $items
     * @param array $parameters
     * @return Expr\Func
     */
    public function in($property, array $items, &$parameters)
    {
        $expr = new Expr();

        return $expr->in($this->getName($property), self::addParameter($property, $items, $parameters));
    }

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return Expr\Comparison
     */
    public function eq($property, $value, &$parameters)
    {
        $expr = new Expr();

        return $expr->eq($this->getName($property), self::addParameter($property, $value, $parameters));
    }

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return Expr\Comparison
     */
    public function neq($property, $value, &$parameters)
    {
        $expr = new Expr();

        return $expr->neq($this->getName($property), self::addParameter($property, $value, $parameters));
    }

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     * @return Expr\Comparison
     */
    public function like($property, $value, &$parameters, $escapeChar = '\\', $singleChar = '_', $wildCard = '%')
    {
        $expr = new Expr();
        if ($escapeChar === $this->escapeChar && $singleChar === $this->singleChar && $wildCard === $this->wildCard) {
            $valueX = self::addParameter($property, $value, $parameters);
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
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @param string $escapeChar
     * @param string $singleChar
     * @param string $wildCard
     * @return Expr\Comparison
     */
    public function notLike($property, $value, &$parameters, $escapeChar = '\\', $singleChar = '_', $wildCard = '%')
    {
        $expr = new Expr();
        if ($escapeChar === $this->escapeChar && $singleChar === $this->singleChar && $wildCard === $this->wildCard) {
            $valueX = self::addParameter($property, $value, $parameters);
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
     * @param $parameters
     * @return Expr\Func
     */
    public function between($property, $lower, $upper, &$parameters)
    {
        $expr = new Expr();

        return $expr->between(
            $this->getName($property),
            self::addParameter($property, $lower, $parameters),
            self::addParameter($property, $upper, $parameters)
        );
    }

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return Expr\Comparison
     */
    public function gt($property, $value, &$parameters)
    {
        $expr = new Expr();

        return $expr->gt($this->getName($property), self::addParameter($property, $value, $parameters));
    }

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return Expr\Comparison
     */
    public function gte($property, $value, &$parameters)
    {
        $expr = new Expr();

        return $expr->gte($this->getName($property), self::addParameter($property, $value, $parameters));
    }

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return Expr\Comparison
     */
    public function lt($property, $value, &$parameters)
    {
        $expr = new Expr();

        return $expr->lt($this->getName($property), self::addParameter($property, $value, $parameters));
    }

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return Expr\Comparison
     */
    public function lte($property, $value, &$parameters)
    {
        $expr = new Expr();

        return $expr->lte($this->getName($property), self::addParameter($property, $value, $parameters));
    }

    /**
     * @param string $property
     * @return string
     */
    public function isNull($property)
    {
        $expr = new Expr();

        return $expr->isNull($this->getName($property));
    }

    /**
     * @param string $property
     * @return string
     */
    public function isNotNull($property)
    {
        $expr = new Expr();

        return $expr->isNotNull($this->getName($property));
    }

    /**
     * @param string $property
     * @param array $geoFeature GeoJSON or an array(w,s,e,n)
     * @param array $parameters
     * @return Expr\Andx
     * @throws \Exception
     */
    public function bbox($property, $geoFeature, &$parameters)
    {
        if (is_array($this->spatialProperty)) {
            // check if $geoFeature is an array(w,s,e,n) or GeoJSON "Feature" / GeoJSON "geometry"
            if (count($geoFeature) === 4 && !isset($geoFeature['geometry'])) {
                $bbox = $geoFeature;
            } else {
                $bbox = self::bboxForGeoJson($geoFeature);
            }
            // no spatial column
            // "spatially intersect" - (share any portion of space)
            return new Expr\Andx(
                array(
                    $this->lt($this->spatialProperty[0], floatval($bbox[2]), $parameters),
                    $this->gt($this->spatialProperty[2], floatval($bbox[0]), $parameters),
                    $this->lt($this->spatialProperty[1], floatval($bbox[3]), $parameters),
                    $this->gt($this->spatialProperty[3], floatval($bbox[1]), $parameters),
                )
            );
        } else {
            throw new \Exception('Operation "bbox" for a spatial database is not yet implemented');
        }
    }

    /**
     * @param string $property
     * @param array $geoFeature GeoJSON
     * @param array $parameters
     * @return Expr\Andx
     * @throws \Exception
     */
    public function contains($property, $geoFeature, &$parameters)
    {
        /** Checks if $geom is completely inside $this->spatialProperty or $property */
        if (is_array($this->spatialProperty)) {
            $bbox = self::bboxForGeoJson($geoFeature);

            return new Expr\Andx(
                array(
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[0]),
                        '<=',
                        self::addParameter($this->spatialProperty[0], floatval($bbox[0]), $parameters)
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[2]),
                        '>=',
                        self::addParameter($this->spatialProperty[2], floatval($bbox[2]), $parameters)
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[1]),
                        '<=',
                        self::addParameter($this->spatialProperty[1], floatval($bbox[1]), $parameters)
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[2]),
                        '>=',
                        self::addParameter($this->spatialProperty[2], floatval($bbox[2]), $parameters)
                    ),
                )
            );
        } else {
            throw new \Exception('Operation "contains" for a spatial database is not yet implemented');
        }
    }

    /**
     * @param string $property
     * @param array $geoFeature GeoJSON
     * @param array $parameters
     * @return Expr\Andx
     * @throws \Exception
     */
    public function within($property, $geoFeature, &$parameters)
    {
        /* Checks if $this->spatialProperty or $property is completely inside $geom */
        if (is_array($this->spatialProperty)) {
            $bbox = self::bboxForGeoJson($geoFeature);

            return new Expr\Andx(
                array(
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[0]),
                        '>=',
                        self::addParameter($this->spatialProperty[0], floatval($bbox[0]), $parameters)
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[2]),
                        '<=',
                        self::addParameter($this->spatialProperty[2], floatval($bbox[2]), $parameters)
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[1]),
                        '>=',
                        self::addParameter($this->spatialProperty[1], floatval($bbox[1]), $parameters)
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[2]),
                        '<=',
                        self::addParameter($this->spatialProperty[2], floatval($bbox[2]), $parameters)
                    ),
                )
            );
        } else {
            throw new \Exception('Operation "contains" for a spatial database is not yet implemented');
        }
    }

    /**
     * @param string $property
     * @param array $geoFeature GeoJSON
     * @param array $parameters
     * @return Expr\Andx
     * @throws \Exception
     */
    public function intersects($property, $geoFeature, &$parameters)
    {
        if (is_array($this->spatialProperty)) {
            // no spatial column
            // "spatially intersect" - (share any portion of space)
            return $this->bbox($property, self::bboxForGeoJson($geoFeature), $parameters);
        } else {
            throw new \Exception('Operation "intersects" for a spatial database is not yet implemented');
        }
    }

    /**
     * @param array $geoFeature GeoJSON "Feature" or GeoJSON "geometry"
     * @return array|mixed|null
     */
    private static function bboxForGeoJson(array $geoFeature)
    {
        if (isset($geoFeature['bbox'])) {
            return $geoFeature['bbox'];
        } elseif (isset($geoFeature['geometry'])) {
            return self::createBbox($geoFeature['geometry']['coordinates']);
        } elseif (isset($geoFeature['coordinates'])) {
            return self::createBbox($geoFeature['coordinates']);
        }

        return null;
    }

    /**
     * @param array $coordinates
     * @return array|null
     */
    private static function createBbox(array $coordinates)
    {
        $bbox = null;
        if (!is_array($coordinates[0])) {
            return self::addToBbox($coordinates[0], $coordinates[1]);
        } elseif (!is_array($coordinates[0][0])) {
            foreach ($coordinates as $coord) {
                $bbox = self::addToBbox($coord[0], $coord[1], $bbox);
            }

            return $bbox;
        } else {
            return self::createBbox($coordinates[0]);
        }
    }

    /**
     * @param $x
     * @param $y
     * @param array|null $bbox
     * @return array
     */
    private static function addToBbox($x, $y, array $bbox = null)
    {
        if ($bbox === null) {
            return array($x, $y, $x, $y);
        } else {
            $bbox[0] = min($bbox[0], $x);
            $bbox[1] = min($bbox[1], $y);
            $bbox[2] = max($bbox[2], $x);
            $bbox[3] = max($bbox[3], $y);

            return $bbox;
        }
    }
}
