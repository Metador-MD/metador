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
     * MetadataInterface constructor.
     * @param ContainerInterface $container
     * @param UserInterface $metadorUser
     */
    public function __construct(
        ContainerInterface $container,
        UserInterface $metadorUser
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

    /**
     * @param $limit
     * @param $page
     * @param $profile
     * @return mixed
     */
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
