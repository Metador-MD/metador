<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;


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

    /**
     * @param string $uuid
     * @return mixed
     */
    public function getByUUID($uuid);

    public function getMetadata($limit, $page, $profile);

    /**
     * @param string $profile
     * @return integer
     */
    public function getMetadataCount($profile);

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
