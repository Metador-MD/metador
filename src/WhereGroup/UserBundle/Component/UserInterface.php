<?php

namespace WhereGroup\UserBundle\Component;

use Doctrine\ORM\NonUniqueResultException;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;
use WhereGroup\UserBundle\Entity\Group;
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
     * @return mixed
     * @throws NonUniqueResultException
     */
    public function count();

    /**
     * @return mixed
     * @throws NonUniqueResultException
     */
    public function countGroups();

    /**
     * @param $id
     * @return mixed
     * @throws MetadorException
     */
    public function get($id);

    /**
     * @param $username
     * @return \WhereGroup\UserBundle\Entity\User
     */
    public function getByUsername($username);

    /**
     * @param $groupname
     * @return Group
     */
    public function getGroupByName($groupname);

    /**
     * @return array
     */
    public function findAll();

    /**
     * @param UserEntity $user
     * @return $this
     * @throws MetadorException
     */
    public function insert(UserEntity $user);

    /**
     * @param $username
     * @param $password
     * @param string $email
     * @param array $groups
     * @return $this
     * @throws MetadorException
     */
    public function createIfNotExists($username, $password, $email = '', $groups = []);

    /**
     * @param $role
     * @param $desciption
     * @return $this
     */
    public function createGroupIfNotExists($role, $desciption = '');

    /**
     * @param UserEntity $user
     * @return $this
     */
    public function update(UserEntity $user);

    /**
     * @param UserEntity $user
     * @return $this
     */
    public function delete(UserEntity $user);

    /**
     * @param $user
     * @param $password
     * @return string
     */
    public function encodePassword($user, $password);

    /**
     * @return mixed|null
     */
    public function getUserFromSession();

    /**
     * @return mixed
     */
    public function getUsernameFromSession();

    /**
     * @param $metadata
     * @param null $user
     * @param null $ignoreRole
     * @return bool
     */
    public function checkMetadataAccess($metadata, $user = null, $ignoreRole = null);

    /**
     * @param int $length
     * @return string
     */
    public function generatePassword($length = 10);

    /**
     * @return array
     */
    public function getRoles();
}
