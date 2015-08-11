<?php

namespace WhereGroup\UserBundle\Entity;

use Doctrine\ORM\EntityRepository;

class GroupRepository extends EntityRepository
{
    private $entity = 'WhereGroupUserBundle:Group';

    public function getAllSorted()
    {
        return $this->getEntityManager()->createQuery(
            "SELECT p FROM $this->entity p ORDER BY p.role"
        )->getResult();
    }
}
