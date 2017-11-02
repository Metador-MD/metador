<?php

namespace WhereGroup\UserBundle\Component;

use WhereGroup\UserBundle\Entity\User as UserEntity;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

/**
 * Interface UserInterface
 * @package WhereGroup\UserBundle\Component
 */
interface UserInterface
{
    /**
     * UserInterface constructor.
     * @param TokenStorageInterface $tokenStorage
     * @param EntityManagerInterface $em
     * @param UserPasswordEncoderInterface $encoder
     */
    public function __construct(
        TokenStorageInterface $tokenStorage,
        EntityManagerInterface $em,
        UserPasswordEncoderInterface $encoder
    );
    public function __destruct();

    /**
     * @param $id
     * @return mixed
     */
    public function get($id);

    /**
     * @param $username
     * @return mixed
     */
    public function getByUsername($username);
    public function findAll();
    public function count();

    /**
     * @param UserEntity $user
     * @return mixed
     */
    public function insert(UserEntity $user);

    /**
     * @param UserEntity $user
     * @return mixed
     */
    public function update(UserEntity $user);

    /**
     * @param UserEntity $user
     * @return mixed
     */
    public function delete(UserEntity $user);

    /**
     * @param $user
     * @param $password
     * @return mixed
     */
    public function encodePassword($user, $password);
    public function getUserFromSession();
    public function getUsernameFromSession();

    /**
     * @param $metadata
     * @param null $user
     * @param null $ignoreRole
     * @return mixed
     */
    public function checkMetadataAccess($metadata, $user = null, $ignoreRole = null);
}
