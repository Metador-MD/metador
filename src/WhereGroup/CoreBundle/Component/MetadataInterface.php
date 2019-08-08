<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\Common\Persistence\ObjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NonUniqueResultException;
use Exception;
use Twig_Error_Loader;
use Twig_Error_Runtime;
use Twig_Error_Syntax;
use WhereGroup\CoreBundle\Entity\MetadataRepository;
use WhereGroup\CoreBundle\Entity\Metadata as EntityMetadata;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;

/**
 * Interface MetadataInterface
 * @package WhereGroup\CoreBundle\Component
 */
interface MetadataInterface
{
    /**
     * Use ID or UUID
     * @param $id
     * @param bool $dispatchEvent
     * @return EntityMetadata
     * @throws MetadataException
     * @internal param $metadataId
     */
    public function getById($id, $dispatchEvent = true);

    /**
     * @param $parentUuid
     * @return array
     */
    public function getChildren($parentUuid);

    /**
     * @return mixed
     * @throws NonUniqueResultException
     */
    public function count();

    /**
     * @return mixed
     */
    public function countAndGroupBySources();

    /**
     * @param $p
     * @return string
     * @throws Exception
     * @throws Twig_Error_Loader
     * @throws Twig_Error_Runtime
     * @throws Twig_Error_Syntax
     */
    public function objectToXml($p);

    /**
     * @param $xml
     * @param $profile
     * @return array|mixed
     * @throws Exception
     */
    public function xmlToObject($xml, $profile);

    /**
     * @param $string
     * @return array
     */
    public function parseXML($string);

    /**
     * @param $p
     * @param null $source
     * @param null $profile
     * @param null $username
     * @param null $public
     * @return EntityMetadata
     * @throws MetadataException
     */
    public function prepareData(&$p, $source = null, $profile = null, $username = null, $public = null);

    /**
     * @param $p
     * @param null $source
     * @param null $profile
     * @param null $username
     * @param null $public
     * @return $this|mixed
     * @throws MetadataException
     * @throws Exception
     */
    public function updateObjectInformation(&$p, $source = null, $profile = null, $username = null, $public = null);

    /**
     * @return string
     * @throws Exception
     */
    public function generateUuid();

    /**
     * Use id or uuid
     * @param $id
     * @return bool|EntityMetadata
     */
    public function exists($id);

    /**
     * Use id or uuid
     * @param $p
     * @param bool $id
     * @param array $options
     * @return EntityMetadata
     * @throws Exception
     */
    public function saveObject($p, $id = null, $options = []);

    /**
     * @param $type
     * @param EntityMetadata $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @param null $path
     * @param array $params
     * @return mixed|void
     */
    public function log($type, $metadata, $operation, $message, $messageParams = [], $path = null, $params = [], $flash = false);

    /**
     * @param $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @param null $path
     * @param array $params
     * @return mixed
     */
    public function success($metadata, $operation, $message, $messageParams = [], $path = null, $params = []);

    /**
     * @param $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @param null $path
     * @param array $params
     * @return mixed
     */
    public function error($metadata, $operation, $message, $messageParams = [], $path = null, $params = [], $flash = false);

    /**
     * @param $id
     * @return mixed|void
     * @throws MetadataException
     */
    public function lock($id);

    /**
     * Use ID or UUID to unlock Metadata.
     * @param $id
     * @return mixed|void
     * @throws MetadataException
     */
    public function unlock($id);

    /**
     * Use ID or UUID to delete Metadata.
     * @param $id
     * @return void
     * @throws MetadataException
     */
    public function deleteById($id);

    /**
     * @param EntityMetadata $entity
     * @param bool $dispatchEvent
     * @param bool $log
     * @param bool $flush
     * @return bool
     * @throws Exception
     */
    public function save($entity, $dispatchEvent = true, $log = true, $flush = true);

    /**
     * @return ObjectRepository|MetadataRepository
     */
    public function getRepository();

    /**
     * @return EntityManagerInterface
     */
    public function getEntityManager();

    /**
     * @param array $source
     * @param array $target
     */
    public function mergeSystemInformations(array $source, array &$target);
}
