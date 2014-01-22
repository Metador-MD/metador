<?php
namespace WhereGroup\MetadorBundle\Component;

class MetadataImport {
    private $parser;

    public function load($xml, $conf) {
        $this->parser = new XmlParser($xml, new XmlParserFunctions());

        foreach($conf['xmlimport']['schema'] as $filename)
            $this->parser->loadSchema(
                file_get_contents($filename));

        $array = $this->parser->parse();

        if(isset($array['p']))
            return $array['p'];
    }
}