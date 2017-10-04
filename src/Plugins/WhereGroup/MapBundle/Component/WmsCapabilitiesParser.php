<?php

namespace Plugins\WhereGroup\MapBundle\Component;

use Plugins\WhereGroup\MapBundle\Entity\Wms;

/**
 * Class WmsCapabilitiesParser
 * @package Plugins\WhereGroup\MapBundle\Component
 * @author Paul Schmidt <panadium@gmx.de>
 */
abstract class WmsCapabilitiesParser
{

    /**
     * The XML representation of the wms capabilites document
     * @var \DOMDocument
     */
    protected $doc;

    /**
     * An xpath-instance
     */
    protected $xpath;

    /**
     * A resolution
     *
     * @var integer
     */
    protected $resolution = 72;

    /**
     * Creates an instance
     *
     * @param \DOMDocument $doc
     */
    public function __construct(\DOMDocument $doc)
    {
        $this->doc = $doc;
        $this->xpath = new \DOMXPath($doc);
        $this->xpath->registerNamespace("xlink", "http://www.w3.org/1999/xlink");
    }

    /**
     * Sets the resolution
     *
     * @param integer $resolution
     */
    protected function setReslolution($resolution)
    {
        $this->resolution = $resolution;
    }

    /**
     * Finds the value
     * @param string $xpath xpath expression
     * @param \DOMNode $contextElm the node to use as context for evaluating the
     * XPath expression.
     * @return string the value of item or the selected item or null
     */
    protected function getValue($xpath, $contextElm = null)
    {
        if (!$contextElm) {
            $contextElm = $this->doc;
        }
        try {
            $elm = $this->xpath->query($xpath, $contextElm)->item(0);
            if (!$elm) {
                return null;
            }
            if ($elm->nodeType == XML_ATTRIBUTE_NODE) {
                return $elm->value;
            } elseif ($elm->nodeType == XML_TEXT_NODE) {
                return $elm->wholeText;
            } elseif ($elm->nodeType == XML_ELEMENT_NODE) {
                return $elm;
            } elseif ($elm->nodeType == XML_CDATA_SECTION_NODE) {
                return $elm->wholeText;
            } else {
                return null;
            }
        } catch (\Exception $E) {
            return null;
        }
    }


    /**
     * Creates a Wms object for a wms document.
     */
    abstract public function parse(Wms &$wms);

    /**
     * Creates a document
     * @param string $data the string containing the XML
     * @return \DOMDocument a GetCapabilites document
     * @throws \Exception if a GetCapabilities xml is not valid
     */
    public static function createDocument($data)
    {
        $doc = new \DOMDocument();
        if (!@$doc->loadXML($data)) {
            throw new \Exception("Die URL liefert kein XML Dokument.");
        }
        // substitute xincludes
        $doc->xinclude();
        if ($doc->documentElement->tagName == "ServiceExceptionReport") {
            $message = $doc->documentElement->nodeValue;
            throw new \Exception($message);
        }

        if ($doc->documentElement->tagName !== "WMS_Capabilities"
            && $doc->documentElement->tagName !== "WMT_MS_Capabilities") {
            throw new \Exception("Die URL liefert kein WMS GetCapabilities Dokument.");
        }

        $version = $doc->documentElement->getAttribute("version");
        if ($version !== "1.1.1" && $version !== "1.3.0") {
            throw new \Exception('Die WMS GetCapabilites Version "'.$version.'" ist nicht unterstützt.');
        }

        return $doc;
    }

    /**
     * Gets a capabilities parser
     *
     * @param \DOMDocument $doc the GetCapabilities document
     * @return WmsCapabilitiesParser111 | WmsCapabilitiesParser130 a capabilities parser
     * @throws \Exception if a service version is not supported
     */
    public static function getParser(\DOMDocument $doc)
    {
        $version = $doc->documentElement->getAttribute("version");
        switch ($version) {
            case "1.1.1":
                return new WmsCapabilitiesParser111($doc);
            case "1.3.0":
                return new WmsCapabilitiesParser130($doc);
            default:
                throw new \Exception('Die WMS GetCapabilites Version "'.$version.'"  ist nicht unterstützt');
        }
    }

    /**
     * @param array $formats
     * @param array $pattern
     * @return mixed|string
     */
    protected function selectFormat(array $formats, array $pattern)
    {
        foreach ($pattern as $pat) {
            foreach ($formats as $format) {
                if (strpos($format, $pat) === 0) {
                    return $format;
                }
            }
        }

        return count($formats) > 0 ? $formats[0] : '';
    }
}
