<?php

namespace WhereGroup\UserBundle\Component;

use WhereGroup\UserBundle\Entity\User as UserEntity;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

interface UserInterface
{
    public function __construct(
        TokenStorageInterface $tokenStorage,
        EntityManagerInterface $em,
        UserPasswordEncoderInterface $encoder
    );
    public function __destruct();
    public function get($id);
    public function getByUsername($username);
    public function findAll();
    public function insert(UserEntity $user);
    public function update(UserEntity $user);
    public function delete(UserEntity $user);
    public function encodePassword($user, $password);
    public function getUserFromSession();
    public function getUsernameFromSession();
    public function checkMetadataAccess($metadata, $user = null, $ignoreRole = null);
}
