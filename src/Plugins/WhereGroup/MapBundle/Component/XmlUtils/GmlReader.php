<?php
/**
 * Created by PhpStorm.
 * User: paul
 * Date: 14.06.17
 * Time: 12:16
 */

namespace Plugins\WhereGroup\MapBundle\Component\XmlUtils;


class GmlReader
{
    /**
     * @var EXmlReader
     */
    protected $xmlReader;
    protected $geometry;

    public function read()
    {

    }

    protected function readAttrs()
    {
        if ($this->xmlReader->hasAttributes) {
            if ($this->xmlReader->moveToAttribute('srsName')) {
//                $this->xmlReader->name, $this->xmlReader->value
            }
            $this->xmlReader->moveToElement();
        }
    }

    private function getSrsName()
    {
        if ($this->xmlReader->hasAttributes && $this->xmlReader->moveToAttribute('srsName')) {
            $srsName = $this->xmlReader->value;
            $this->xmlReader->moveToElement();

            return $srsName;
        } else {
            return null;
        }
    }

    private function guessType()
    {
        $gtype = null;
        switch ($this->xmlReader->name) {
            case 'gml:Point':
                $gtype = Geometry::POINT;
                break;
            case 'gml:MultiPoint':
                $gtype = Geometry::MULTIPOINT;
                break;
            case 'gml:LineString':
                $gtype = Geometry::LINESTRING;
                break;
            case 'gml:Polygon':
                $gtype = Geometry::POLYGON;
                break;
            case 'gml:MultiLineString': # GML 2.x
            case 'gml:MultiCurve': # GML 3.x
                $gtype = Geometry::MULTILINESTRING;
                break;
            case 'gml:MultiPolygon': # GML 2.x
            case 'gml:MultiSurface': # GML 3.x
                $gtype = Geometry::MULTIPOLYGON;
                break;
            default:
                throw new \Exception('not yet implemented gml type:'.$this->xmlReader->name);
        }
        if ($gtype) {
            $dimension = 2;
            $srsName = '';
            if ($this->xmlReader->hasAttributes) {
                if($this->xmlReader->moveToAttribute('srsName')){
                    $srsName = $this->xmlReader->value;
                }
//                if($this->xmlReader->moveToAttribute('dimension')){#???
//                    $dimension = $this->xmlReader->value;
//                }
                $this->xmlReader->moveToElement();
            }
            $this->geometry = new Geometry($dimension, $gtype, $srsName);
        }
    }

    private function readCoordinates()
    {
        switch ($this->xmlReader->name) {
            case 'gml:coordinates': # @decimal default ".", @cs default ",", ts" default "&#x20;"
                $coordinates = preg_split('/[\s,]/', $this->xmlReader->value);
                break;
            case 'gml:pos':
                break;
            case 'gml:posList':
                $coordinates = preg_split('/[\s,]/', $this->xmlReader->value);
                break;
//            case 'gml:coord':# 3d X Y Z
//                break;
//            default:
//                throw new \Exception('not yet implemented gml type:' . $arr[1][1]);
        }
    }
}