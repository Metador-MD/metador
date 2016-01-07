<?php

namespace WhereGroup\Plugin\ImportBundle\Component;

/**
 * Interface MetadataImportInterface
 * @package WhereGroup\Plugin\ImportBundle\Component
 */
interface MetadataImportInterface
{
    /**
     * Convert a XML to Metador data object.
     * @param $xml
     * @return array
     */
    public function load($xml);
}
