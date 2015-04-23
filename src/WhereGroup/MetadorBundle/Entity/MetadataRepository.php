<?php

namespace WhereGroup\MetadorBundle\Entity;

use Doctrine\ORM\EntityRepository;

class MetadataRepository extends EntityRepository
{
    private $entity = 'WhereGroupMetadorBundle:Metadata';

    public function getAllByProfile($profile)
    {
        return $this->getEntityManager()->createQuery(
            "SELECT * FROM $entity p WHERE p.profile = :profile"
        )
        ->setParameter('profile', $profile)
        ->getResult();
    }
}
