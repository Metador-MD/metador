<?php

namespace WhereGroup\UserBundle\Entity;

use Doctrine\ORM\EntityRepository;

class UserRepository extends EntityRepository
{
    private $entity = 'WhereGroupUserBundle:User';

    public function getAllByProfile($profile)
    {
        return $this->getEntityManager()->createQuery(
            "SELECT * FROM $entity p WHERE p.profile = :profile"
        )
        ->setParameter('profile', $profile)
        ->getResult();
    }
}
