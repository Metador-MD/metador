<?php

namespace WhereGroup\ThemeBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * Class MapRepository
 * @package WhereGroup\ThemeBundle\Entity
 */
class MapRepository extends EntityRepository
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
        foreach ($entity->getWmslist() as $wms) {
            $this->getEntityManager()->getRepository(get_class($wms))->remove($wms);
        }
        $this->getEntityManager()->remove($entity);
        $this->getEntityManager()->flush();

        return $this;
    }
}
