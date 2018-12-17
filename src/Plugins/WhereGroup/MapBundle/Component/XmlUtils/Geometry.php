<?php
/**
 * Created by PhpStorm.
 * User: paul
 * Date: 14.06.17
 * Time: 11:32
 */

namespace Plugins\WhereGroup\MapBundle\Component\XmlUtils;

/**
 * Class Geometry
 * @package Plugins\WhereGroup\MapBundle\Component\XmlUtils
 * @author Paul Schmidt <panadium@gmx.de>
 */
class Geometry
{
    const POINT = 1;
    const MULTIPOINT = 2;
    const LINESTRING = 3;
    const MULTILINESTRING = 4;
    const POLYGON = 5;
    const MULTIPOLYGON = 6;

    /**
     * @var integer geometry type
     */
    protected $type;

    /**
     * @var integer dimension
     */
    protected $dim;

    /**
     * @var string coordinate reference system
     */
    protected $srsName;

    /**
     * @var array ordinates
     */
    protected $ordinates;

    /**
     * Geometry constructor.
     */
    public function __construct($dim = 2, $type = null, $srsName = null)
    {
        $this->dim = $dim;
        $this->type = $type;
        $this->srsName = $srsName;
        $this->ordinates = [];
    }

    /**
     * @return int
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param int $type
     * @return Geometry
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * @return int
     */
    public function getDim()
    {
        return $this->dim;
    }

    /**
     * @param int $dim
     * @return Geometry
     */
    public function setDim($dim)
    {
        $this->dim = $dim;

        return $this;
    }

    /**
     * @return string
     */
    public function getSrsName()
    {
        return $this->srsName;
    }

    /**
     * @param string $srsName
     * @return Geometry
     */
    public function setSrsName($srsName)
    {
        $this->srsName = $srsName;

        return $this;
    }

    /**
     * @return array
     */
    public function getOrdinates()
    {
        return $this->ordinates;
    }

    /**
     * @param array $ordinates
     * @return Geometry
     */
    public function setOrdinates(array $ordinates)
    {
        $this->ordinates = $ordinates;

        return $this;
    }

    /**
     * @param array $ordinates
     * @return Geometry
     */
    public function addOrdinates(array $ordinates)
    {
        foreach ($ordinates as $ordinate) {
            $this->ordinates[] = floatval($ordinate);
        }

        return $this;
    }

    /**
     * @param array $ordinates
     * @return Geometry
     */
    public function addOrdinatesSet(array $ordinates)
    {
        $ordinatesHelp = [];
        foreach ($ordinates as $ordinate) {
            $ordinatesHelp[] = floatval($ordinate);
        }
        $this->ordinates[] = $ordinatesHelp;

        return $this;
    }
}
