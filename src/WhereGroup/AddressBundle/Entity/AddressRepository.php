<?php

namespace WhereGroup\AddressBundle\Entity;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;

/**
 * Class AddressRepository
 * @package WhereGroup\AddressBundle\Entity
 */
class AddressRepository extends EntityRepository
{
    const ENTITY = 'MetadorAddressBundle:Address';

    /**
     * @param $entity
     * @return $this
     * @throws ORMException
     * @throws OptimisticLockException
     */
    public function save($entity)
    {
        $this->getEntityManager()->persist($entity);
        $this->getEntityManager()->flush();

        return $this;
    }

    /**
     * @param $entity
     * @return $this
     * @throws ORMException
     * @throws OptimisticLockException
     */
    public function remove($entity)
    {
        $this->getEntityManager()->remove($entity);
        $this->getEntityManager()->flush();

        return $this;
    }

    /**
     * @return mixed
     * @throws NonUniqueResultException
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

    /**
     * @param $terms
     * @param int $page
     * @param int $hits
     * @param bool $countOnly
     * @return array
     * @throws NonUniqueResultException
     */
    public function search($terms, $page = 1, $hits = 10, $countOnly = false)
    {
        $qb = $this
            ->getEntityManager()
            ->getRepository(self::ENTITY)
            ->createQueryBuilder('u');

        if ($countOnly === false) {
            $qb
                ->select('u')
                ->setFirstResult(($page * $hits) - $hits)
                ->setMaxResults($hits);
        } else {
            $qb->select('count(u)');
        }

        $orx = $qb->expr()->orX();

        foreach (explode(' ', strtolower($terms)) as $word) {
            $orx->add(
                $qb->expr()->like('u.searchfield', $qb->expr()->literal('%' . $word . '%'))
            );
        }

        $qb->where($orx);

        if ($countOnly === false) {
            return $qb->getQuery()->getArrayResult();
        }

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @return mixed
     */
    public function truncate()
    {
        return $this
            ->getEntityManager()
            ->createQuery('DELETE FROM ' . self::ENTITY)
            ->execute();
    }
}
