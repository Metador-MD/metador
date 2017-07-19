<?php
/**
 * Created by PhpStorm.
 * User: paul
 * Date: 14.06.17
 * Time: 11:26
 */

namespace Plugins\WhereGroup\MapBundle\Component\XmlUtils;

use Plugins\WhereGroup\MapBundle\Component\XmlUtils\XmlAssocArrayReader as xaar;

class FeatureJsonWriter implements IContextWriter
{
    const MEMBER = 'member'; // wfs:member -> wfs 2.0, gml:featureMember -> wfs < 2.0

    /**
     * @var array
     */
    protected $content;

    /**
     * @var IContextWriter
     */
    protected $gmlWriter;

    /**
     * @var boolean
     */
    protected $crsForEach = true;

    public function __construct()
    {
        $this->gmlWriter = new GmlJsonWriter();
        $this->reset();
    }

    public function getCrs()
    {
        if (!$this->crsForEach) {
            return $this->gmlWriter->getSrsName();
        } else {
            return null;
        }
    }

    public function reset()
    {
        $this->content = array();
        $this->gmlWriter->reset();
    }

    public function write(array $content)
    {
//        $this->content = array(
//            'type' => 'Feature',
//        );
        $feature = $this->findFeature($content[0]);
        $json = $this->read($feature[xaar::KEY_CHILDREN]);

        return $json;
    }

    private function findFeature($content)
    {
        $pos = strpos(strtolower($content[xaar::KEY_NAME]), self::MEMBER);
        if ($pos >= 0) { // without prefix -> 0 with prefix prefix.length + 1
            return $content[xaar::KEY_CHILDREN][0];
        }
    }

    private function read($feature)
    {
        $json = array(
            'type' => 'Feature',
            'properties' => array(),

        );
        foreach ($feature as $item) {
            if (isset($item[xaar::KEY_VALUE])) { //
                $json['properties'][$item[xaar::KEY_NAME]] = $item[xaar::KEY_VALUE];
            } else { // geom
                $json['geometry'] = $this->gmlWriter->write($item[xaar::KEY_CHILDREN]);
                if ($this->crsForEach && $this->gmlWriter->getSrsName() !== null) {
                    $json['crs'] = GmlJsonWriter::namedCrs($this->gmlWriter->getSrsName());
                }
            }
        }
        return $json;
    }

    private function addProperty(array &$feature, $name, $value)
    {
        $feature['properties'][$name] = $value;
    }
}