<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * Class SourceRepository
 * @package WhereGroup\CoreBundle\Entity
 */
class SourceRepository extends EntityRepository
{
    /**
     * @return mixed
     */
    public function count()
    {
        return $this
            ->getEntityManager()
            ->getRepository("MetadorCoreBundle:Source")
            ->createQueryBuilder('u')
            ->select('count(u.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * @param $entity
     * @return $this
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
     */
    public function remove($entity)
    {
        $this->getEntityManager()->remove($entity);
        $this->getEntityManager()->flush();

        return $this;
    }
}
