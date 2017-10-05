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
    public function all($filterType = null, $filterValue = null)
    {
        $qb = $this->createQueryBuilder('c')->select('c');

        if (!is_null($filterType)) {
            $qb->andWhere('c.filterType = :filterType')->setParameter('filterType', $filterType);
        }

        if (!is_null($filterValue)) {
            $qb->andWhere('c.filterValue = :filterValue')->setParameter('filterValue', $filterValue);
        }

        $rows = $qb->orderBy('c.filterType', 'ASC')->getQuery()->getArrayResult();

        for ($i=0; $i<count($rows); $i++) {
            if ((boolean)$rows[$i]['json'] === true) {
                $rows[$i]['value'] = json_decode($rows[$i]['value'], true);
            }

            unset($rows[$i]['json']);
        }

        return $rows;
    }

    /**
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function removeAll($filterType = null, $filterValue = null)
    {
        $qb = $this->createQueryBuilder('c')->delete(self::ENTITY, 'c');

        if (!is_null($filterType)) {
            $qb->andWhere('c.filterType = :filterType')->setParameter('filterType', $filterType);
        }

        if (!is_null($filterValue)) {
            $qb->andWhere('c.filterValue = :filterValue')->setParameter('filterValue', $filterValue);
        }

        return $qb->getQuery()->execute();
    }

    /**
     * @param $key
     * @param $filterType
     * @param $filterValue
     * @param null $default
     * @return mixed
     */
    public function get($key, $filterType = null, $filterValue = null, $default = null)
    {
        try {
            $qb = $this->createQueryBuilder('c')
                ->select('c')
                ->where('c.key = :key')
                ->setParameter('key', $key);

            if (!is_null($filterType)) {
                $qb->andWhere('c.filterType = :filterType')->setParameter('filterType', $filterType);
            }

            if (!is_null($filterValue)) {
                $qb->andWhere('c.filterValue = :filterValue')->setParameter('filterValue', $filterValue);
            }

            return $qb->getQuery()->getSingleResult();
        } catch (NoResultException $e) {
            return $default;
        }
    }

    /**
     * @param $key
     * @param $filterType
     * @param $filterValue
     * @return mixed
     */
    public function remove($key, $filterType = null, $filterValue = null)
    {
        $qb = $this->createQueryBuilder('c')
            ->delete(self::ENTITY, 'c')
            ->where('c.key = :key')
            ->setParameter('key', $key);

        if (!is_null($filterType)) {
            $qb->andWhere('c.filterType = :filterType')->setParameter('filterType', $filterType);
        }

        if (!is_null($filterValue)) {
            $qb->andWhere('c.filterValue = :filterValue')->setParameter('filterValue', $filterValue);
        }

        $qb->getQuery()->execute();
    }

    /**
     * @param $key
     * @param $filterType
     * @param $filterValue
     * @param null $default
     * @return mixed
     */
    public function getValue($key, $filterType = null, $filterValue = null, $default = null)
    {
        $qb = $this->createQueryBuilder('c')
            ->select('c.value, c.json')
            ->where('c.key = :key')
            ->setParameter('key', $key);

        if (!is_null($filterType)) {
            $qb->andWhere('c.filterType = :filterType')->setParameter('filterType', $filterType);
        }

        if (!is_null($filterValue)) {
            $qb->andWhere('c.filterValue = :filterValue')->setParameter('filterValue', $filterValue);
        }

        $result = $qb->getQuery()->getScalarResult();

        if (!isset($result[0])) {
            return $default;
        }

        if ((boolean)$result[0]['json'] === true) {
            return json_decode($result[0]['value'], true);
        }

        return $result[0]['value'];
    }

    /**
     * @param $key
     * @param $value
     * @param $filterType
     * @param $filterValue
     */
    public function set($key, $value, $filterType = '', $filterValue = '')
    {
        /** @var Configuration $entity */
        $entity = $this->get($key, $filterType, $filterValue);

        if ($entity) {
            $entity->setValue($value);
        } else {
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
