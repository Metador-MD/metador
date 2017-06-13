<?php

namespace Plugins\WhereGroup\MapBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * Class WmsRepository
 * @package Plugins\WhereGroup\MapBundle\Entity
 */
class WmsRepository extends EntityRepository
{
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

    /**
     * @return array
     */
    public function all()
    {
        return $this->createQueryBuilder('c')
            ->select('c.gcUrl, c.gmUrl')
            ->orderBy('c.priority', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
