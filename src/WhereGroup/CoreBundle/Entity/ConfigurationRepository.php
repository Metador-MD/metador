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
        $rows = $this->createQueryBuilder('c')
            ->select('c.key, c.value, c.json')
            ->where('c.filterType = :filterType')
            ->andWhere('c.filterValue = :filterValue')
            ->setParameter('filterType', $filterType)
            ->setParameter('filterValue', $filterValue)
            ->orderBy('c.filterType', 'ASC')
            ->getQuery()
            ->getResult();

        $result = array();

        foreach ($rows as $row) {
            $result[$row['key']] = $row['json'] === true ? json_decode($row['value']) : $row['value'];
        }

        return $result;
    }

    /**
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function removeAll($filterType = null, $filterValue = null)
    {
        return $this->createQueryBuilder('c')
            ->delete(self::ENTITY, 'c')
            ->where('c.filterType = :filterType')
            ->andWhere('c.filterValue = :filterValue')
            ->setParameter('filterType', $filterType)
            ->setParameter('filterValue', $filterValue)
            ->getQuery()
            ->execute();
    }

    /**
     * @param $key
     * @param $filterType
     * @param $filterValue
     * @param null $default
     * @return mixed
     */
    public function get($key, $filterType, $filterValue, $default = null)
    {
        try {
            return $this->getEntityManager()->createQuery(
                "SELECT c FROM " . self::ENTITY .
                " c WHERE c.key = :key AND c.filterType = :filterType AND c.filterValue = :filterValue"
            )
                ->setParameter('key', $key)
                ->setParameter('filterType', $filterType)
                ->setParameter('filterValue', $filterValue)
                ->getSingleResult();
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
    public function remove($key, $filterType, $filterValue)
    {
        return $this->createQueryBuilder('c')
            ->delete(self::ENTITY, 'c')
            ->where('c.key = :key')
            ->andWhere('c.filterType = :filterType')
            ->andWhere('c.filterValue = :filterValue')
            ->setParameter('key', $key)
            ->setParameter('filterType', $filterType)
            ->setParameter('filterValue', $filterValue)
            ->getQuery()
            ->execute();
    }

    /**
     * @param $key
     * @param $filterType
     * @param $filterValue
     * @param null $default
     * @return mixed
     */
    public function getValue($key, $filterType, $filterValue, $default)
    {
        try {
            $qb = $this->createQueryBuilder('c')
                ->select('c.value, c.json')
                ->where('c.key = :key')
                ->andWhere('c.filterType = :filterType')
                ->andWhere('c.filterValue = :filterValue')
                ->setParameters(array(
                    'key' => $key,
                    'filterType' => $filterType,
                    'filterValue' => $filterValue
                ));

            $result = $qb->getQuery()->getScalarResult();

            if ($result[0]['json'] === true) {
                return json_decode($result[0]['value']);
            }

            return $result[0]['value'];
        } catch (NoResultException $e) {
            return $default;
        }
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
}
