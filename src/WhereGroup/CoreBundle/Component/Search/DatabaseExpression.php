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
    private $parameters;

    /**
     * @var Expr
     */
    private $resultExpression;

    /**
     * @var array
     */
    private $propertyMap;

    /**
     * DatabaseExpression constructor.
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
        $this->parameters = array();
        $this->propertyMap = array();
    }

    public function setPropertyMap(array $propertyMap)
    {
        $this->propertyMap = $propertyMap;
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
     * @return array
     */
    public function getParameters()
    {
        return $this->parameters;
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

    /**
     * @param $property
     * @param array $geoFeature GeoJSON "Feature" or GeoJSON "geometry"
     * @return Expr\Andx
     * @throws \Exception
     */
    public function bbox($property, array $geoFeature)
    {
        if (is_array($this->spatialProperty)) {
            // check if $geoFeature is an array(w,s,e,n) or GeoJSON "Feature" / GeoJSON "geometry"
            $bbox = count($geoFeature) === 4 && is_float($geoFeature) ? $geoFeature : self::bboxForGeoJson($geoFeature);
            // no spatial column
            // "spatially intersect" - (share any portion of space)
            return new Expr\Andx(
                array(
                    $this->lt($this->spatialProperty[0], $bbox[2]),
                    $this->gt($this->spatialProperty[2], $bbox[0]),
                    $this->lt($this->spatialProperty[1], $bbox[3]),
                    $this->gt($this->spatialProperty[3], $bbox[1]),
                )
            );
        } else {
            throw new \Exception('Operation "bbox" for a spatial database is not yet implemented');
        }
    }

    /**
     * @param $property
     * @param array $geoFeature GeoJSON "Feature" or GeoJSON "geometry"
     * @return Expr\Andx
     * @throws \Exception
     */
    public function contains($property, $geoFeature)
    {
        /** Checks if $geom is completely inside $this->spatialProperty or $property */
        if (is_array($this->spatialProperty)) {
            $bbox = self::bboxForGeoJson($geoFeature);

            return new Expr\Andx(
                array(
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[0]),
                        '<=',
                        $this->addParameter($this->spatialProperty[0], $bbox[0])
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[2]),
                        '>=',
                        $this->addParameter($this->spatialProperty[2], $bbox[2])
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[1]),
                        '<=',
                        $this->addParameter($this->spatialProperty[1], $bbox[1])
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[2]),
                        '>=',
                        $this->addParameter($this->spatialProperty[2], $bbox[2])
                    ),
                )
            );
        } else {
            throw new \Exception('Operation "contains" for a spatial database is not yet implemented');
        }
    }

    /**
     * @param $property
     * @param array $geoFeature GeoJSON "Feature" or GeoJSON "geometry"
     * @return Expr\Andx
     * @throws \Exception
     */
    public function within($property, $geoFeature)
    {
        /* Checks if $this->spatialProperty or $property is completely inside $geom */
        if (is_array($this->spatialProperty)) {
            $bbox = self::bboxForGeoJson($geoFeature);

            return new Expr\Andx(
                array(
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[0]),
                        '>=',
                        $this->addParameter($this->spatialProperty[0], $bbox[0])
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[2]),
                        '<=',
                        $this->addParameter($this->spatialProperty[2], $bbox[2])
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[1]),
                        '>=',
                        $this->addParameter($this->spatialProperty[1], $bbox[1])
                    ),
                    new Expr\Comparison(
                        $this->getName($this->spatialProperty[2]),
                        '<=',
                        $this->addParameter($this->spatialProperty[2], $bbox[2])
                    ),
                )
            );
        } else {
            throw new \Exception('Operation "contains" for a spatial database is not yet implemented');
        }
    }

    /**
     * @param $property
     * @param array $geoFeature GeoJSON "Feature" or GeoJSON "geometry"
     * @return Expr\Andx
     * @throws \Exception
     */
    public function intersects($property, $geoFeature)
    {
        if (is_array($this->spatialProperty)) {
            // no spatial column
            // "spatially intersect" - (share any portion of space)
            return $this->bbox($property, self::bboxForGeoJson($geoFeature));
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
