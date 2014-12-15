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
    /** @var MetadataImportInterface  */
    private $metadataImport;

    /** @var MetadataInterface  */
    private $metadata;

    /** @var  array */
    private $conf;

    /**
     * @param MetadataImportInterface $metadataImport
     * @param MetadataInterface $metadata
     * @param $conf
     */
    public function __construct(
        MetadataImportInterface $metadataImport,
        MetadataInterface $metadata,
        $conf
    ) {
        $this->metadataImport = $metadataImport;
        $this->metadata       = $metadata;
        $this->conf           = $conf;
    }

    /**
     * Unset objects.
     */
    public function __destruct()
    {
        unset(
            $this->metadataImport,
            $this->metadata,
            $this->conf
        );
    }

    /**
     * @param $string
     * @return bool|array
     */
    public function parseGetCapabilitiesUrls($string)
    {
        preg_match_all("/(htt[^\n]+)/i", $string, $matches);

        return (!isset($matches[1]) || empty($matches[1]))
            ? false
            : $matches[1];
    }

    /**
     * @param $url
     * @return array|bool
     */
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

    /**
     * @param $url
     * @return bool|string
     */
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
    }

    /**
     * @param $uuid
     * @return bool
     */
    public function metadataExists($uuid)
    {
        $entity = $this->metadata->getByUUID($uuid);

        return (bool)$entity
            ? $entity->getId()
            : false;
    }

    /**
     * @param array $p
     * @param string $uuid
     */
    public function insert($p, $uuid)
    {
        $p['fileIdentifier'] = $uuid;
        $p['identifier'][0]['code'] = $p['fileIdentifier'];
        $p['identifier'][0]['codespace'] = "";
        $p['dateStamp'] = date('Y-m-d');
        $p['hierarchyLevel'] = 'service';

        $this->metadata->saveObject($p);
    }

    /**
     * @param array $p
     * @param string $uuid
     * @param integer $id
     */
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
