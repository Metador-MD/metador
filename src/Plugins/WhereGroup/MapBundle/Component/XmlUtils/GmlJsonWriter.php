<?php
/**
 * Created by PhpStorm.
 * User: paul
 * Date: 17.07.17
 * Time: 17:20
 */

namespace Plugins\WhereGroup\MapBundle\Component\XmlUtils;

use Plugins\WhereGroup\MapBundle\Component\XmlUtils\XmlAssocArrayReader as xaar;

/**
 * Class GmlJsonWriter
 * @package Plugins\WhereGroup\MapBundle\Component\XmlUtils
 * @author Paul Schmidt <panadium@gmx.de>
 */
class GmlJsonWriter implements IContextWriter
{
    const POINT = 'Point';
    const MULTIPOINT = 'MultiPoint';
    const LINESTRING = 'LineString';
    const MULTILINESTRING = 'MultiLineString';
    const POLYGON = 'Polygon';
    const MULTIPOLYGON = 'MultiPolygon';

    protected $srsName;

    public function __construct()
    {
        $this->srsName = null;
        $this->reset();
    }

    /**
     * @return null
     */
    public function getSrsName()
    {
        return $this->srsName;
    }

    /**
     * @param string $srsName
     * @return GmlJsonWriter
     */
    public function setSrsName($srsName)
    {
        $this->srsName = $srsName;

        return $this;
    }


    public function reset()
    {
        $this->content = [];
    }

    public function write(array $content)
    {
        $json = array(
            'coordinates' => [],
        );
        if ($this->srsName === null
            && isset($content[0][xaar::KEY_ATTRS])
            && isset($content[0][xaar::KEY_ATTRS]['srsName'])) {
            $this->srsName = $content[0][xaar::KEY_ATTRS]['srsName'];
        }

        return $this->findGmlV3($content);
    }

    private function findGmlV3(array $content) // GML v.3.3
    {
        $c = $content[0];
        switch ($c[xaar::KEY_NAME]) {
            case 'gml:Point':
                return $this->createJson(
                    $this->coordsToGJ($this->findCoordsV3($c[xaar::KEY_CHILDREN][0]))[0],
                    self::POINT
                );
            case 'gml:MultiPoint': // gml:MultiPoint/gml:pointMember[?]/gml:Point/gml:pos
                $coords = [];
                foreach ($c[xaar::KEY_CHILDREN] as $pm) {
                    $coords[] =
                        $this->coordsToGJ($this->findCoordsV3($pm[xaar::KEY_CHILDREN][0][xaar::KEY_CHILDREN][0]))[0];
                }

                return $this->createJson($coords, self::MULTIPOINT);
            case 'gml:LineString':
                return $this->createJson(
                    $this->coordsToGJ($this->findCoordsV3($c[xaar::KEY_CHILDREN][0])),
                    self::LINESTRING
                );
            case 'gml:Polygon':
                $coords = [];
                foreach ($c[xaar::KEY_CHILDREN] as $ring) {
                    $coords[] = $this->coordsToGJ($this->findCoordsV3($ring));
                }

                return $this->createJson($coords, self::POLYGON);
//                 @TODO
//            case 'gml:MultiCurve': # GML 3.x
//                $json['type'] = self::MULTILINESTRING;
//                return $this->createJson($coords, self::MULTILINESTRING);
//            case 'gml:MultiSurface': # GML 3.x
//                $json['type'] = self::MULTIPOLYGON;
//                return $this->createJson($coords, self::MULTIPOLYGON);
            default:
                throw new \Exception('Der Geometrietyp ist nicht unterstützt:'.$c[xaar::KEY_NAME]);
        }
    }

    private function createJson($coords, $type)
    {
        return array(
            'type' => $type,
            'coordinates' => $coords,
        );
    }

    /**
     * @param $item
     * @return array
     * @throws \Exception
     */
    private function findCoordsV3($item)
    {
        switch ($item[xaar::KEY_NAME]) {
//            case 'gml:coordinates': # @decimal default ".", @cs default ",", ts" default "&#x20;"  GMLv2.X
//                return array_map('floatval', preg_split('/[\s,]/', $item[xaar::KEY_VALUE]));
            case 'gml:pos':
                return array_map('floatval', preg_split('/[\s,]/', $item[xaar::KEY_VALUE]));
            case 'gml:posList':
                return array_map('floatval', preg_split('/[\s,]/', $item[xaar::KEY_VALUE]));
//            case 'gml:coord':# 3d X Y Z
//                break;
            default:
                if (isset($item[xaar::KEY_CHILDREN])) {
                    return $this->findCoordsV3($item[xaar::KEY_CHILDREN][0]);
                } else {
                    throw new \Exception('GML v3.x: Koordinaten können nicht ausgelesen werden.');
                }
        }
    }


    /**
     * @param $ordinates
     * @param int $fromDim
     * @param int $toDim
     * @return array
     */
    public static function coordsToGJ($ordinates, $fromDim = 2, $toDim = 2)
    {
        $result = [];
        $max = $toDim - $fromDim;
        for ($i = $fromDim - 1; $i < count($ordinates); $i += $fromDim) {
            $pointOrdinates = [];
            for ($s = -$fromDim + 1; $s <= $max; $s++) {
                $pointOrdinates[] = $s > 0 ? 0.0 : $ordinates[$i + $s];
            }
            $result[] = $pointOrdinates;
        }

        return $result;
    }

    /**
     * @param $name
     * @return array named crs
     */
    public static function namedCrs($name)
    {
        return array(
            "type" => "name",
            "properties" => array(
                "name" => $name,
            ),
        );
    }

    /**
     * @param $href
     * @param $type
     * @return array
     */
    public static function linkedCrs($href, $type)
    {
        return array(
            "type" => "link",
            "properties" => array(
                "href" => $href,
                "type" => $type,
            ),
        );
    }
}
