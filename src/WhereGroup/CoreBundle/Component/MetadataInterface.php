<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\UserBundle\Component\UserInterface;

/**
 * Interface MetadataInterface
 * @package WhereGroup\CoreBundle\Component
 */
interface MetadataInterface
{
    /**
     * @param $metadataId
     * @param bool $dispatchEvent
     * @return mixed
     */
    public function getById($metadataId, $dispatchEvent = true);

    /**
     * @param $uuid
     * @param bool $dispatchEvent
     * @return mixed
     */
    public function getByUUID($uuid, $dispatchEvent = true);

    /**
     * @param $uuid
     * @return mixed
     */
    public function exists($uuid);

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
     * @param null $uuid
     * @return mixed
     */
    public function saveObject($p, $id = null, $uuid = null);

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
