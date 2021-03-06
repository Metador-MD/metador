<?php

namespace WhereGroup\UserBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * Class GroupRepository
 * @package WhereGroup\UserBundle\Entity
 */
class GroupRepository extends EntityRepository
{
    const ENTITY = 'MetadorUserBundle:Group';

    /**
     * @return array
     */
    public function findAllSorted()
    {
        return $this->getEntityManager()->createQuery(
            "SELECT p FROM " . self::ENTITY . " p ORDER BY p.role"
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
