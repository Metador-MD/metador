<?php

namespace Plugins\WhereGroup\MapBundle\Component;

use Plugins\WhereGroup\MapBundle\Entity\Wms;

/**
 * Class WmsCapabilitiesParser111
 * @package Plugins\WhereGroup\MapBundle\Component
 */
class WmsCapabilitiesParser111 extends WmsCapabilitiesParser
{

    /**
     * @inheritdoc
     */
    public function __construct(\DOMDocument $doc)
    {
        parent::__construct($doc);
    }

    /**
     * @inheritdoc
     */
    public function parse(Wms &$wms)
    {
        $root = $this->doc->documentElement;
        $wms->setVersion($this->getValue('./@version', $root));
        $this->parseService($wms, $this->getValue('./Service', $root));
        $wms->setFormats([]);
        $this->parseCapabilityRequest($wms, $this->getValue('./Capability/Request', $root));
        $wms->setLayerList([]);
        $this->parseLayer($wms, $this->getValue('./Capability/Layer', $root));
        // set default values: all available layers, a first founded format
        $wms->setLayers($wms->getLayerList());
        $wms->setFormat(
            $this->selectFormat(
                $wms->getFormats(),
                ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']
            )
        );
    }

    /**
     * Adds service parameters to Wms
     * @param Wms $wms
     * @param \DOMElement $contextElm
     */
    private function parseService(Wms &$wms, \DOMElement $contextElm)
    {
        $title = $this->getValue('./Title/text()', $contextElm);
        $wms->setTitle($title ? $title : WMS::TITLE_DEFAULT);
    }

    /**
     * Adds request parameters to Wms
     * @param Wms $wms
     * @param \DOMElement $contextElm
     */
    private function parseCapabilityRequest(Wms &$wms, \DOMElement $contextElm)
    {
        $wms->setGcUrl(
            $this->getValue(
                './GetCapabilities/DCPType/HTTP/Get/OnlineResource/@xlink:href',
                $contextElm
            )
        );
        $wms->setGmUrl($this->getValue('./GetMap/DCPType/HTTP/Get/OnlineResource/@xlink:href', $contextElm));
        $formatList = $this->xpath->query('./GetMap/Format', $contextElm);
        if ($formatList !== null) {
            foreach ($formatList as $item) {
                $wms->addFormat($this->getValue('./text()', $item));
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
        $name = $this->getValue('./Name/text()', $contextElm);
        /* @var \DOMNodeList $tempList */
        $tempList = $this->xpath->query('./Layer', $contextElm);
        // add only named layer and no root or group layer
        if ($name !== null && $tempList->length === 0) {
            $wms->addToLayerList($name);
        }
        foreach ($tempList as $item) {
            $this->parseLayer($wms, $item);
        }
    }
}
