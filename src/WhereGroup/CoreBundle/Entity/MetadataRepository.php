<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\ORM\EntityRepository;

class MetadataRepository extends EntityRepository
{
    private $entity = 'WhereGroupCoreBundle:Metadata';

    public function getAllByProfile($profile)
    {
        return $this->getEntityManager()->createQuery(
            "SELECT * FROM $this->entity p WHERE p.profile = :profile"
        )
        ->setParameter('profile', $profile)
        ->getResult();
    }
}
