<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Interface MetadataImportInterface
 * @package WhereGroup\CoreBundle\Component
 * @author A. R. Pour
 */
interface MetadataImportInterface
{
    /**
     * Convert a XML to Metador data object.
     * @param $xml
     * @param $conf
     * @return array
     */
    public function load($xml, $conf);


    /**
     * Convert a WMS GetCapabilities to Metador data object.
     * @param $xml
     * @param $conf
     * @return array
     */
    public function loadWMS($xml, $conf);
}
