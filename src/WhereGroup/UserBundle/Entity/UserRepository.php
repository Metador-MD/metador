<?php

namespace WhereGroup\UserBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * Class UserRepository
 * @package WhereGroup\UserBundle\Entity
 */
class UserRepository extends EntityRepository
{
    const ENTITY = 'MetadorUserBundle:User';

    /**
     * @return array
     */
    public function findAllSorted()
    {
        return $this->getEntityManager()->createQuery(
            "SELECT p FROM " . self::ENTITY . " p ORDER BY p.username"
        )->getResult();
    }

    /**
     * @return mixed
     * @throws \Doctrine\ORM\NoResultException
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function countAll()
    {
        return $this
            ->getEntityManager()
            ->getRepository(self::ENTITY)
            ->createQueryBuilder('u')
            ->select('count(u.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }
}
