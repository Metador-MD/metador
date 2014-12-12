<?php

namespace WhereGroup\MetadorBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Interface MetadataInterface
 * @package WhereGroup\MetadorBundle\Component
 * @author A. R. Pour
 */
interface MetadataInterface
{
/**
     * @param ContainerInterface $container
     * @param MetadorUserInterface $metadorUser
     * @param AddressInterface $address
     */
    public function __construct(
        ContainerInterface $container,
        MetadorUserInterface $metadorUser,
        AddressInterface $address
    );

    /**
     * @param $id
     * @return mixed
     */
    public function getById($id);

    public function getByUUID($uuid);

    /**
     * @param $limit
     * @param $offset
     * @param null $type
     * @return mixed
     */
    public function getMetadata($limit, $offset, $type = null);

    public function getMetadataCount($type);

    /**
     * @param $limit
     * @param $offset
     * @return mixed
     */
    public function getDataset($limit, $offset);

    /**
     * @param $limit
     * @param $offset
     * @return mixed
     */
    public function getService($limit, $offset);
    public function getServiceCount();
    public function getDatasetCount();

    /**
     * @param $p
     * @param bool $id
     * @param null $username
     * @param bool $public
     * @return bool
     */
    public function saveObject($p, $id = false, $username = null, $public = false);

    /**
     * @param $id
     * @return bool
     */
    public function deleteById($id);
}
