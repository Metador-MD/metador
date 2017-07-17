<?php

namespace WhereGroup\UserBundle\Component;

use WhereGroup\UserBundle\Entity\Group;
use WhereGroup\UserBundle\Entity\User as UserEntity;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

/**
 * Class User
 * @package WhereGroup\UserBundle\Component
 */
class User implements UserInterface
{
    /**
     * @var TokenStorageInterface
     */
    private $tokenStorage;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var UserPasswordEncoderInterface
     */
    private $encoder;

    const USER_ENTITY = 'MetadorUserBundle:User';
    const GROUP_ENTITY = 'MetadorUserBundle:Group';

    /**
     * User constructor.
     * @param TokenStorageInterface $tokenStorage
     * @param EntityManagerInterface $em
     * @param UserPasswordEncoderInterface $encoder
     */
    public function __construct(
        TokenStorageInterface $tokenStorage,
        EntityManagerInterface $em,
        UserPasswordEncoderInterface $encoder
    ) {
        $this->tokenStorage = $tokenStorage;
        $this->em           = $em;
        $this->encoder      = $encoder;
    }

    public function __destruct()
    {
        unset($this->trokenStorage, $this->em, $this->encoder);
    }

    /**
     * @param $id
     * @return mixed
     * @throws MetadorException
     */
    public function get($id)
    {
        $user = $this->getUserRepository()->findOneById($id);

        if (!$user) {
            throw new MetadorException("Benutzer nicht gefunden.");
        }

        return $user;
    }

    /**
     * @param $username
     * @return \WhereGroup\UserBundle\Entity\User
     */
    public function getByUsername($username)
    {
        return $this->getUserRepository()->findOneByUsername($username);
    }

    /**
     * @param $groupname
     * @return Group
     */
    public function getGroupByName($groupname)
    {
        return $this->getGroupRepository()->findOneByRole($groupname);
    }

    /**
     * @return array
     */
    public function findAll()
    {
        return $this->getUserRepository()->findAllSorted();
    }

    /**
     * @param UserEntity $user
     * @return $this
     * @throws MetadorException
     */
    public function insert(UserEntity $user)
    {
        if ($this->getUserRepository()->findOneByUsername($user->getUsername())) {
            throw new MetadorException("Benutzer bereits vorhanden.");
        }

        $user->setPassword($this->encodePassword($user, $user->getPassword()));

        $this->update($user);

        return $this;
    }

    /**
     * @param UserEntity $user
     * @return $this
     */
    public function update(UserEntity $user)
    {
        $this->em->persist($user);
        $this->em->flush();

        return $this;
    }

    /**
     * @param UserEntity $user
     * @return $this
     */
    public function delete(UserEntity $user)
    {
        $this->em->remove($user);
        $this->em->flush();

        return $this;
    }

    /**
     * @param $user
     * @param $password
     * @return string
     */
    public function encodePassword($user, $password)
    {
        return $this->encoder->encodePassword($user, $password);
    }

    /**
     * @return mixed|null
     */
    public function getUserFromSession()
    {
        $token = $this->tokenStorage->getToken();
        return is_object($token) ? $token->getUser() : null;
    }

    /**
     * @return mixed
     */
    public function getUsernameFromSession()
    {
        $user = $this->tokenStorage->getToken()->getUser();

        return $user->getUsername();
    }

    /**
     * @param $metadata
     * @param null $user
     * @param null $ignoreRole
     * @return bool
     */
    public function checkMetadataAccess($metadata, $user = null, $ignoreRole = null)
    {
        if (is_null($user)) {
            $user = $this->getUserFromSession();
        }

        if (!is_object($user)) {
            return false;
        }

        // OWNER HAS ACCESS
        if ($metadata->getInsertUser()->getId() === $user->getId()) {
            return true;
        }

        // todo: grant access with voter?
        return false;
    }

    /**
     * @param int $length
     * @return string
     */
    public function generatePassword($length = 10)
    {
        $password = "";
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        srand((double)microtime()*1000000);

        for ($i = 0; $i < $length; $i++) {
            $password .= substr($chars, rand() % strlen($chars), 1);
        }

        return $password;
    }

    /**
     * @return \Doctrine\Common\Persistence\ObjectRepository|\WhereGroup\UserBundle\Entity\UserRepository
     */
    private function getUserRepository()
    {
        return $this->em->getRepository(self::USER_ENTITY);
    }

    /**
     * @return \Doctrine\Common\Persistence\ObjectRepository|\WhereGroup\UserBundle\Entity\GroupRepository
     */
    private function getGroupRepository()
    {
        return $this->em->getRepository(self::GROUP_ENTITY);
    }
}
