<?php

namespace Plugins\WhereGroup\MapBundle\Component;

use Plugins\WhereGroup\MapBundle\Entity\Wms;

/**
 * Class WmsCapabilitiesParser130
 * @package Plugins\WhereGroup\MapBundle\Component
 */
class WmsCapabilitiesParser130 extends WmsCapabilitiesParser
{

    /**
     * @inheritdoc
     */
    public function __construct(\DOMDocument $doc)
    {
        parent::__construct($doc);

        foreach ($this->xpath->query('namespace::*', $this->doc->documentElement) as $node) {
            $nsPrefix = $node->prefix;
            $nsUri = $node->nodeValue;
            if ($nsPrefix == "" && $nsUri == "http://www.opengis.net/wms") {
                $nsPrefix = "wms";
            }
            $this->xpath->registerNamespace($nsPrefix, $nsUri);
        }
    }

    /**
     * @inheritdoc
     */
    public function parse(Wms &$wms)
    {
        $root = $this->doc->documentElement;
        $wms->setVersion($this->getValue("./@version", $root));
        $this->parseService($wms, $this->getValue("./wms:Service", $root));
        $wms->setFormats(array());
        $this->parseCapabilityRequest($wms, $this->getValue("./wms:Capability/wms:Request", $root));
        $wms->setLayerList(array());
        $this->parseLayer($wms, $this->getValue("./wms:Capability/wms:Layer", $root));
        // set default values: all available layers, a first founded format
        $wms->setLayers($wms->getLayerList());
        $wms->setFormat(
            $this->selectFormat($wms->getFormats(), array('image/png', 'image/jpg', 'image/jpeg', 'image/gif'))
        );

        return $wms;
    }

    /**
     * Adds service parameters to Wms
     * @param Wms $wms
     * @param \DOMElement $contextElm
     */
    private function parseService(Wms &$wms, \DOMElement $contextElm)
    {
        $wms->setTitle($this->getValue("./wms:Title/text()", $contextElm));
    }

    /**
     * Adds request parameters to Wms
     * @param Wms $wms
     * @param \DOMElement $contextElm
     */
    private function parseCapabilityRequest(Wms &$wms, \DOMElement $contextElm)
    {
        $wms->setGcUrl($this->getValue(
            './wms:GetCapabilities/wms:DCPType/wms:HTTP/wms:Get/wms:OnlineResource/@xlink:href',
            $contextElm));
        $wms->setGmUrl($this->getValue(
            './wms:GetMap/wms:DCPType/wms:HTTP/wms:Get/wms:OnlineResource/@xlink:href',
            $contextElm));

        $formatList = $this->xpath->query('./wms:GetMap/wms:Format', $contextElm);
        if ($formatList !== null) {
            foreach ($formatList as $item) {
                $wms->addFormat($this->getValue("./text()", $item));
            }
        }

    }

    /**
     * Adds layer parameters to Wms
     * @param Wms $wms wms object
     * @param \DOMElement $contextElm context element
     */
    private function parseLayer(Wms &$wms, \DOMElement $contextElm)
    {
        $name = $this->getValue("./wms:Name/text()", $contextElm);
        if ($name !== null) {
            $wms->addToLayerList($name);
        }
        $tempList = $this->xpath->query("./wms:Layer", $contextElm);
        if ($tempList !== null) {
            foreach ($tempList as $item) {
                $this->parseLayer($wms, $item);
            }
        }
    }

}
