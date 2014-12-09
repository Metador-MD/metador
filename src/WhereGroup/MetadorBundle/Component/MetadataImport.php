<?php
namespace WhereGroup\MetadorBundle\Component;

/**
 * Class MetadataImport
 * @package WhereGroup\MetadorBundle\Component
 * @author A. R. Pour
 */
class MetadataImport
{
    /**
     * Convert a XML to Metador data object.
     * @param $xml
     * @param $conf
     * @return array
     */
    public function load($xml, $conf)
    {
        $parser = new XmlParser($xml, new XmlParserFunctions());

        foreach ($conf['xmlimport']['schema'] as $filename) {
            $parser->loadSchema(file_get_contents($filename));
        }

        $array = $parser->parse();

        return isset($array['p']) ? $array['p'] : array();
    }


    /**
     * Convert a WMS GetCapabilities to Metador data object.
     * @param $xml
     * @param $conf
     * @return array
     */
    public function loadWMS($xml, $conf)
    {
        // read version
        $parser = new XmlParser($xml, new XmlParserFunctions());
        $parser->loadSchema(file_get_contents($conf['wmsimport']['path'] . 'wmsversion.json'));
        $version = $parser->parse();

        unset($parser);

        // read metadata
        $parser = new XmlParser($xml, new XmlParserFunctions());
        switch($version["version"]) {
            case "1.1.1":
                $parser->loadSchema(file_get_contents($conf['wmsimport']['path'] . 'wms_1-1-1.json'));
                break;
            case "1.3.0":
                $parser->loadSchema(file_get_contents($conf['wmsimport']['path'] . 'wms_1-3-0.json'));
                break;
        }

        $array = $parser->parse();

        return isset($array['p']) ? $array['p'] : array();
    }
}
