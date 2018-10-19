<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Class ExprHandler
 * @package WhereGroup\CoreBundle\Component\Search
 */
abstract class ExprHandler
{
    /**
     * @var string
     */
    protected $escapeChar = '\\';

    /**
     * @var string
     */
    protected $singleChar = '_';

    /**
     * @var string
     */
    protected $wildCard = '%';

    /**
     * @var array
     */
    protected $aliasMap;

    /**
     * @var string
     */
    protected $defaultAlias;

    /**
     * @var array|string
     */
    protected $spatialProperty = array('bboxw', 'bboxs', 'bboxe', 'bboxn');

    /**
     * @var array
     */
    protected $propertyMap;

    /**
     * DatabaseExprHandler constructor.
     * @param array $aliasMap
     * @param string $defaultAlias
     * @param array $propertyMap
     */
    public function __construct(
        array $aliasMap,
        $defaultAlias,
        array $propertyMap
    ) {
        $this->aliasMap = $aliasMap;
        $this->defaultAlias = $defaultAlias;
        $this->setPropertyMap($propertyMap);
    }

    /**
     * @return array
     */
    public function getPropertyMap()
    {
        return $this->propertyMap;
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
     * @return array
     */
    public function getAliasMap()
    {
        return $this->aliasMap;
    }

    /**
     * @return string
     */
    public function getDefaultAlias()
    {
        return $this->defaultAlias;
    }

    /**
     * @param $property
     * @param $value
     * @param $parameters
     * @param $escapeChar
     * @param $singleChar
     * @param $wildCard
     * @return null|string|string[]
     */
    protected function valueForLike($property, $value, &$parameters, $escapeChar, $singleChar, $wildCard)
    {
        /* replace all $wildCards at $value with $this->wildCard */
        $valueX = preg_replace(self::getRegex($escapeChar, $wildCard), $this->wildCard, $value);
        /* replace all $singleChar at $value with $this->singleChar */
        $valueX = preg_replace(self::getRegex($escapeChar, $singleChar), $this->singleChar, $valueX);
        /* replace all $escapeChar at $value with $this->escapeChar */
        $valueX = preg_replace(self::getRegex($escapeChar, $escapeChar), $this->escapeChar, $valueX);

        return $valueX;
    }

    /**
     * @param $name
     * @param string $delimiter
     * @return string
     * @throws PropertyNameNotFoundException
     */
    protected function getName($name, $delimiter = '.')
    {

        return $name;
//
//        $splittedName = explode('.', $name);
//
//        /* count($splittedName) === 1 -> property name is without alias -> use the default alias */
//        $alias = count($splittedName) === 1 ? $this->defaultAlias : strtolower($splittedName[0]);
//        $propertyName = count($splittedName) === 1 ? strtolower($splittedName[0]) : strtolower($splittedName[1]);
//
//        if (!isset($this->aliasMap[$alias]) || !isset($this->propertyMap[$alias][$propertyName])) {
//            throw new PropertyNameNotFoundException($name);
//        }
//
//        return $this->aliasMap[$alias].$delimiter.$this->propertyMap[$alias][$propertyName];
    }

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return string
     * @throws PropertyNameNotFoundException
     */
    protected function addParameter($property, $value, &$parameters)
    {
        $hlp = $this->getName($property, '_');
        $name = $hlp.count($parameters);
        $parameters[$name] = $value;

        return ':'.$name;
    }

    /**
     * Creates a regex.
     * @param string $escape
     * @param string $character
     * @return string
     */
    protected static function getRegex($escape, $character)
    {
        $first = self::addEscape($escape);
        $second = self::addEscape($character);

        return '/(?<!'.$first.')('.$second.')/';
    }

    /**
     * @param $character
     * @return string
     */
    protected static function addEscape($character)
    {
        if (strpos('!"#$%&\'()*+,-./:;<=>?@[\]^_`{|}~', $character) !== false) {
            return '\\'.$character;
        } else {
            return $character;
        }
    }

    /**
     * @param $x
     * @param $y
     * @param array|null $bbox
     * @return array
     */
    protected static function addToBbox($x, $y, array $bbox = null)
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


    /**
     * @param array $geoFeature GeoJSON "Feature" or GeoJSON "geometry"
     * @return array|mixed|null
     */
    protected static function bboxForGeoJson(array $geoFeature)
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
    protected static function createBbox(array $coordinates)
    {
        $bbox = null;

        if (!is_array($coordinates[0])) {
            return self::addToBbox($coordinates[0], $coordinates[1]);
        } elseif (!is_array($coordinates[0][0])) {
            foreach ($coordinates as $coord) {
                $bbox = self::addToBbox($coord[0], $coord[1], $bbox);
            }

            return $bbox;
        }

        return self::createBbox($coordinates[0]);
    }
}
