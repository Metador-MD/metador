<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NoResultException;

/**
 * Class ConfigurationRepository
 * @package WhereGroup\CoreBundle\Entity
 */
class ConfigurationRepository extends EntityRepository
{
    const ENTITY = 'MetadorCoreBundle:Configuration';

    /**
     * @param $filterType
     * @param $filterValue
     * @return array
     */
    public function all($filterType, $filterValue)
    {
        return $this->createQueryBuilder('c')
            ->select('c.key, c.value')
            ->where('c.filterType = :filterType')
            ->andWhere('c.filterValue = :filterValue')
            ->setParameter('filterType', $filterType)
            ->setParameter('filterValue', $filterValue)
            ->orderBy('c.filterType', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @param $key
     * @param $filterType
     * @param $filterValue
     * @return mixed
     */
    public function get($key, $filterType, $filterValue)
    {
        return $this->getEntityManager()->createQuery(
            "SELECT c FROM " . self::ENTITY .
            " c WHERE c.key = :key AND c.filterType = :filterType AND c.filterValue = :filterValue"
        )
        ->setParameter('key', $key)
        ->setParameter('filterType', $filterType)
        ->setParameter('filterValue', $filterValue)
        ->getSingleResult();
    }

    /**
     * @param $key
     * @param $value
     * @param $filterType
     * @param $filterValue
     */
    public function set($key, $value, $filterType, $filterValue)
    {
        /** @var Configuration $entity */
        try {
            $entity = $this->get($key, $filterType, $filterValue);
            $entity->setValue($value);
        } catch (NoResultException $e) {
            $entity = new Configuration();
            $entity
                ->setKey($key)
                ->setValue($value)
                ->setFilterType($filterType)
                ->setFilterValue($filterValue);
        }

        $this->getEntityManager()->persist($entity);
        $this->getEntityManager()->flush();
    }

}
