<?php

namespace WhereGroup\ThemeBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * Class WmsRepository
 * @package WhereGroup\ThemeBundle\Entity
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
}
