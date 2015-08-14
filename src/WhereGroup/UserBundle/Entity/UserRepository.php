<?php

namespace WhereGroup\UserBundle\Entity;

use Doctrine\ORM\EntityRepository;

class UserRepository extends EntityRepository
{
    private $entity = 'WhereGroupUserBundle:User';

    public function findAllSorted()
    {
        return $this->getEntityManager()->createQuery(
            "SELECT p FROM $this->entity p ORDER BY p.username"
        )->getResult();
    }
}
