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
     * @var array|string
     */
    protected $spatialProperty = ['bboxw', 'bboxs', 'bboxe', 'bboxn'];

    protected $idx;

    public function __construct()
    {
        $this->idx = 0;
    }

    /**
     * @param $escapeChar
     * @param $singleChar
     * @param $wildCard
     * @param $value
     * @return null|string|string[]
     */
    protected function valueForLike($escapeChar, $singleChar, $wildCard, $value)
    {
        $value = preg_replace(self::getRegex($escapeChar, $wildCard), $this->wildCard, $value);
        $value = preg_replace(self::getRegex($escapeChar, $singleChar), $this->singleChar, $value);
        $value = preg_replace(self::getRegex($escapeChar, $escapeChar), $this->escapeChar, $value);

        return $value;
    }

    /**
     * Creates a regex.
     * @param string $escape
     * @param string $character
     * @return string
     */
    private static function getRegex($escape, $character)
    {
        return '/(?<!'.self::escape($escape).')('.self::escape($character).')/';
    }

    /**
     * @param $character
     * @return string
     */
    private static function escape($character)
    {
        if (strpos('!"#$%&\'()*+,-./:;<=>?@[\]^_`{|}~', $character) !== false) {
            return '\\'.$character;
        }

        return $character;
    }

    /**
     * @param $name
     * @return string
     */
    protected function getName($name)
    {
        return $name;
    }

    /**
     * @param string $property
     * @param mixed $value
     * @param array $parameters
     * @return string
     */
    protected function addParameter($property, $value, &$parameters)
    {
        $key = str_replace('.', '_', $property) . '_' . ($this->idx++);

        $parameters[$key] = $value;

        return ':' . $key;
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
            return [$x, $y, $x, $y];
        }

        $bbox[0] = min($bbox[0], $x);
        $bbox[1] = min($bbox[1], $y);
        $bbox[2] = max($bbox[2], $x);
        $bbox[3] = max($bbox[3], $y);

        return $bbox;
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
        }

        if (!is_array($coordinates[0][0])) {
            foreach ($coordinates as $coord) {
                $bbox = self::addToBbox($coord[0], $coord[1], $bbox);
            }

            return $bbox;
        }

        return self::createBbox($coordinates[0]);
    }

    /**
     * @param array $geoFeature
     * @return string
     * @throws \Exception
     */
    protected function jsonGeometryToWkt(array $geoFeature)
    {
        $geom = $geoFeature['geometry'];
        switch ($geom["type"]) {
            case "Point":
                return "POINT(" . $geom["coordinates"][0] . " " . $geom["coordinates"][1] . ")";
            case "MultiPoint":
                $coords = $this->toStringCoords($geom["coordinates"]);
                return "MULTIPOINT(" . implode(",", $coords) . ")";
            case "LineString":
                $coords = $this->toStringCoords($geom["coordinates"]);
                return "LINESTRING(" . implode(",", $coords) . ")";
            case "Polygon":
                $rings = $this->toSetOfStringCoords($geom["coordinates"]);
                return "POLYGON(" . implode(",", $rings) . ")";
            case "MultiLineString":
                $lines = $this->toSetOfStringCoords($geom["coordinates"]);
                return "MULTILINESTRING(" . implode(",", $lines) . ")";
            case "MultiPolygon":
                $multi = [];
                foreach ($geom["coordinates"] as $poly) {
                    $rings = $this->toSetOfStringCoords($poly);
                    $multi[] = "(" . implode(",", $rings) . ")";
                }
                return "MULTIPOLYGON(" . implode(",", $multi) . ")";
        }
        throw new \Exception("not supported geometry type.");
    }

    /**
     * @param array $coordsArr
     * @return array
     */
    private function toStringCoords(array $coordsArr)
    {
        return array_map(function ($val) {
            return $val[0] . " " . $val[1];
        }, $coordsArr);
    }

    /**
     * @param $list
     * @return array
     */
    private function toSetOfStringCoords($list)
    {
        $set = [];
        foreach ($list as $item) {
            $coords = $this->toStringCoords($item);
            $set[] = "(" . implode(",", $coords) . ")";
        }
        return $set;
    }
}
