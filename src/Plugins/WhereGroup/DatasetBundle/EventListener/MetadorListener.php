<?php

namespace Plugins\WhereGroup\DatasetBundle\EventListener;

use WhereGroup\CoreBundle\Event\MetadataChangeEvent;

/**
 * Class MetadorListener
 * @package Plugins\WhereGroup\DatasetBundle\EventListener
 */
class MetadorListener
{
    /**
     * @param MetadataChangeEvent $event
     */
    public function onPreSave(MetadataChangeEvent $event)
    {
        $metadata = $event->getDataset();
        $metadata->setObject(
            $this->rebuildArrayKeys($metadata->getObject())
        );
    }

    /**
     * Renumber the array key's.
     * @return array Metadata array
     */
    private function rebuildArrayKeys($data)
    {
        $keys = array(
            'responsiblePartyMetadata',
            'identifier',
            'bbox',
            'temporalExtent',
            'dataquality',
            'responsibleParty',
            'resolution'
        );

        foreach ($keys as $key) {
            if (empty($data[$key])) {
                unset($data[$key]);
            }


            if (isset($data[$key])) {
                $array = array();

                foreach ($data[$key] as $element) {
                    $array[] = $element;
                }

                $data[$key] = $array;
            }
        }
        return $data;
    }

    /**
     * Adds german service name to the metadata array.
     * @return array Metadata array
     */
    private function prepairService($data)
    {
        // Set german hierarchy level name based on service local name
        if (!empty($data['serviceType'])) {
            $hierarchyLevelNames = array(
                "view" => "Darstellungsdienste",
                "invoke" => "Dienste zum Abrufen von Geodatendiensten",
                "download" => "Download-Dienste",
                "other" => "Sonstige Dienste",
                "discovery" => "Suchdienste",
                "transformation" => "Transformationsdienste"
            );

            $data['hierarchyLevelName'] = $hierarchyLevelNames[$data['serviceType']];
        }

        return $data;
    }
}
