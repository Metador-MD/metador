<?php

namespace Plugins\WhereGroup\MapBundle\Component;

use Plugins\WhereGroup\MapBundle\Entity\Wms;

/**
 * Created by PhpStorm.
 * User: paul
 * Date: 02.05.17
 * Time: 11:12
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
            if(!$elm) {
                return null;
            }
            if ($elm->nodeType == XML_ATTRIBUTE_NODE) {
                return $elm->value;
            } else if ($elm->nodeType == XML_TEXT_NODE) {
                return $elm->wholeText;
            } else if ($elm->nodeType == XML_ELEMENT_NODE) {
                return $elm;
            } else if ($elm->nodeType == XML_CDATA_SECTION_NODE) {
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
     * @return Wms
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
            throw new \Exception("Das Dokument kann nicht geparst werden.");
        }
        // substitute xincludes
        $doc->xinclude();
        if ($doc->documentElement->tagName == "ServiceExceptionReport") {
            $message = $doc->documentElement->nodeValue;
            throw new \Exception($message);
        }

        if ($doc->documentElement->tagName !== "WMS_Capabilities"
            && $doc->documentElement->tagName !== "WMT_MS_Capabilities") {
            throw new \Exception("Das Dokument ist nicht unterstützt.");
        }

        $version = $doc->documentElement->getAttribute("version");
        if ($version !== "1.1.1" && $version !== "1.3.0") {
            throw new \Exception('Die Version ist nicht unterstützt.');
        }
        return $doc;
    }
//
//    public static function getSchemas(\DOMDocument $doc)
//    {
//        $schemaLocations = array();
//        if ($element = $dom->documentElement->getAttributeNS('http://www.w3.org/2001/XMLSchema-instance',
//            'schemaLocation')) {
//            $items = preg_split('/\s+/', $element);
//            for ($i = 0, $nb = count($items); $i < $nb; $i += 2) {
//                $schemaLocations[$items[$i - 1]] = $items[$i];
//            }
//        }
//        return $schemaLocations;
//    }
//
//    public static function validate(\DOMDocument $doc)
//    {
////        $doc = new \DOMDocument();
//        $validate = null;
//        if (!@$doc->loadXML($data, $validate && isset($doc->doctype) ? LIBXML_DTDLOAD | LIBXML_DTDVALID : 0)) {
//            throw new XmlParseException("Das Document kann nicht geparst werden.");
//        }
//        // substitute xincludes
//        $doc->xinclude();
//        if ($doc->documentElement->tagName == "ServiceExceptionReport") {
//            $message = $doc->documentElement->nodeValue;
//            throw new WmsException($message);
//        }
//
//        if ($doc->documentElement->tagName !== "WMS_Capabilities"
//            && $doc->documentElement->tagName !== "WMT_MS_Capabilities") {
//            throw new NotSupportedVersionException("mb.wms.repository.parser.not_supported_document");
//        }
//
//        $version = $doc->documentElement->getAttribute("version");
//        if ($version !== "1.1.1" && $version !== "1.3.0") {
//            throw new NotSupportedVersionException('mb.wms.repository.parser.not_supported_version');
//        }
//
//        if ($validate) {
//            if (isset($doc->doctype) && !@$doc->validate()) { // check with DTD
//                throw new XmlParseException("mb.wms.repository.parser.not_valid_dtd");
//            } else if (!isset($doc->doctype)) {
//                // TODO create CREATEDSCHEMA
//                if ($version === '1.3.0' && !$doc->schemaValidate('CREATEDSCHEMA')) {
//                    throw new XmlParseException("mb.wms.repository.parser.not_valid_xsd");
//                }
//            }
//        }
//        return $doc;
//    }

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
                throw new \Exception('Die Version ist nicht unterstützt');
        }
    }

}
