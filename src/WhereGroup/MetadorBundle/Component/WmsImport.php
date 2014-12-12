<?php
namespace WhereGroup\MetadorBundle\Component;

use WhereGroup\MetadorBundle\Component\MetadataImportInterface;
use WhereGroup\MetadorBundle\Component\MetadataInterface;

use Rhumsaa\Uuid\Uuid;
use Rhumsaa\Uuid\Exception\UnsatisfiedDependencyException;

/**
 * Class WmsImport
 * @package WhereGroup\MetadorBundle\Component
 * @author A. R. Pour
 */
class WmsImport
{
    private $metadataImport;
    private $metadata;
    private $conf;

    public function __construct(
        MetadataImportInterface $metadataImport,
        MetadataInterface $metadata,
        $conf
    ) {
        $this->metadataImport = $metadataImport;
        $this->metadata       = $metadata;
        $this->conf           = $conf;
    }

    public function __destruct()
    {
        unset(
            $this->metadataImport,
            $this->conf
        );
    }

    public function parseGetCapabilitiesUrls($string)
    {
        preg_match_all("/(htt[^\n]+)/i", $string, $matches);

        return (!isset($matches[1]) || empty($matches[1]))
            ? false
            : $matches[1];
    }

    public function isGetCapabilitiesUrl($url)
    {
        if ((bool)parse_url(trim($url))) {
            try {
                $p = $this->metadataImport->loadWMS(
                    @file_get_contents(trim($url)),
                    $this->conf
                );

                if (!empty($p)) {
                    return $p;
                }

            } catch (\Exception $e) {
                return false;
            }
        }

        return false;
    }

    public function convertUrlToUuid($url)
    {
        try {
            $urlArray = parse_url(strtolower(trim($url)));

            $urlArray['query'] = isset($urlArray['query'])
                ? explode("&", $urlArray['query'])
                : array();

            sort($urlArray['query']);

            $string =
                $urlArray['host'] .
                $urlArray['path'] .
                implode("", $urlArray['query']);

            $string = str_replace("/", "", $string);

            return Uuid::uuid5(Uuid::NAMESPACE_DNS, $string)->toString();

        } catch (UnsatisfiedDependencyException $e) {
            return false;
        }

        return false;
    }

    public function metadataExists($uuid)
    {
        $entity = $this->metadata->getByUUID($uuid);

        return (bool)$entity
            ? $entity->getId()
            : false;
    }

    public function insert($p, $uuid)
    {
        $p['fileIdentifier'] = $uuid;
        $p['identifier'][0]['code'] = $p['fileIdentifier'];
        $p['identifier'][0]['codespace'] = "";
        $p['dateStamp'] = date('Y-m-d');
        $p['hierarchyLevel'] = 'service';

        $this->metadata->saveObject($p);
    }

    public function update($p, $uuid, $id)
    {
        $p['fileIdentifier'] = $uuid;
        $p['identifier'][0]['code'] = $p['fileIdentifier'];
        $p['identifier'][0]['codespace'] = "";
        $p['dateStamp'] = date('Y-m-d');
        $p['hierarchyLevel'] = 'service';

        $this->metadata->saveObject($p, $id);
    }
}
