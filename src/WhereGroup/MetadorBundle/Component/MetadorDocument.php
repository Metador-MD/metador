<?php
namespace WhereGroup\MetadorBundle\Component;

class MetadorDocument
{

    public static function normalize($data) {
        $data = self::rebuildArrayKeys($data);

        $type = strtolower($data['hierarchyLevel']);

        if($type === 'service') {
            $data = self::prepairService($data);
        }

        return $data;
    }

    /**
     * Renumber the array key's.
     * @return array Metadata array
     */
    private static function rebuildArrayKeys($data) {
        $keys = array(
            'responsiblePartyMetadata',
            'identifier',
            'bbox',
            'temporalExtent',
            'dataquality',
            'responsiblePart',
            'resolution'
        );

        foreach($keys as $key) {
            if(isset($data[$key])) {
                $array = array();

                foreach($data[$key] as $element)
                    $array[] = $element;

                $data[$key] = $array;
            }
        }
        
        return $data;
    }

    /**
     * Adds german service name to the metadata array.
     * @return array Metadata array
     */
    private static function prepairService($data) {
        // Set german hierarchy level name based on service local name
        if(!empty($data['serviceType'])) {
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