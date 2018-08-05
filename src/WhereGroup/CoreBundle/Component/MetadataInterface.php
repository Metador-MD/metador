<?php

namespace WhereGroup\CoreBundle\Component;

use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Entity\Metadata;

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
     * @return Metadata
     * @throws MetadataException
     * @internal param $metadataId
     */
    public function getById($id, $dispatchEvent = true);

    /**
     * @param $id
     * @return mixed
     */
    public function exists($id);

    /**
     * @param $p
     * @param null $source
     * @param null $profile
     * @param null $username
     * @param null $public
     * @return mixed
     */
    public function updateObject(&$p, $profile = null, $source = null, $username = null, $public = null);

    /**
     * @param $p
     * @param null $id
     * @return mixed
     */
    public function saveObject($p, $id = null);

    /**
     * @param $id
     * @return mixed
     */
    public function lock($id);

    /**
     * @param $id
     * @return mixed
     */
    public function unlock($id);

    /**
     * @param $id
     * @return mixed
     */
    public function deleteById($id);

    /**
     * @param $entity
     * @param bool $dispatchEvent
     * @return mixed
     */
    public function save($entity, $dispatchEvent = true);

    /**
     * @param $type
     * @param $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @return mixed
     */
    public function log($type, $metadata, $operation, $message, $messageParams = array());

    /**
     * @param $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @return mixed
     */
    public function success($metadata, $operation, $message, $messageParams = array());

    /**
     * @param $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @return mixed
     */
    public function error($metadata, $operation, $message, $messageParams = array());
}
