<?php

namespace WhereGroup\UserBundle\Component;

use WhereGroup\UserBundle\Entity\User as UserEntity;
use WhereGroup\CoreBundle\Component\MetadorException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

/**
 * Class User
 * @package WhereGroup\UserBundle\Component
 */
class User implements UserInterface
{
    private $tokenStorage;
    private $em;
    private $encoder;
    private $repository = 'MetadorUserBundle:User';

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
        $user = $this->getRepository()->findOneById($id);

        if (!$user) {
            throw new MetadorException("Benutzer nicht gefunden.");
        }

        return $user;
    }

    /**
     * @param $username
     * @return mixed
     */
    public function getByUsername($username)
    {
        return $this->getRepository()->findOneByUsername($username);
    }

    /**
     * @return array
     */
    public function findAll()
    {
        return $this->getRepository()->findAllSorted();
    }

    /**
     * @param UserEntity $user
     * @return $this
     * @throws MetadorException
     */
    public function insert(UserEntity $user)
    {
        if ($this->getRepository()->findOneByUsername($user->getUsername())) {
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

        if (is_null($ignoreRole)) {
            $ignoreRole = array(
                'ROLE_SYSTEM_USER',
                'ROLE_SYSTEM_SUPERUSER',
                'ROLE_ADMIN',
                'ROLE_HELPTEXT_ADMIN');
        }

        foreach ($user->getRoles() as $userRole) {
            foreach ($metadata->getGroups() as $group) {
                if ($userRole === $group && !in_array($group, $ignoreRole)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @return \Doctrine\Common\Persistence\ObjectRepository|\WhereGroup\UserBundle\Entity\UserRepository
     */
    private function getRepository()
    {
        return $this->em->getRepository($this->repository);
    }
}
