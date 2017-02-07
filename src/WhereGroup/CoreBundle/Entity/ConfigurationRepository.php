<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * Class ConfigurationRepository
 * @package WhereGroup\CoreBundle\Entity
 */
class ConfigurationRepository extends EntityRepository
{
    private $entity = 'MetadorCoreBundle:Configuration';

    public function all($filterType, $filterValue)
    {
        return $this->createQueryBuilder('c')
            ->where('c.filterType = :filterType')
            ->andWhere('c.filterValue = :filterValue')
            ->setParameter('filterType', $filterType)
            ->setParameter('filterValue', $filterValue)
            ->orderBy('c.filterType', 'ASC')
            ->getQuery()
            ->getResult(1)
        ;
    }

    public function get($key, $filterType, $filterValue)
    {
        return $this->getEntityManager()->createQuery(
            "SELECT c FROM $this->entity c WHERE c.key = :key AND c.filterType = :filterType AND c.filterValue = :filterValue"
        )
        ->setParameter('key', $key)
        ->setParameter('filterType', $filterType)
        ->setParameter('filterValue', $filterValue)
        ->getSingleResult();
    }

    public function set($key, $value, $filterType, $filterValue)
    {
        $em = $this->getEntityManager();

        $config = $this->createQueryBuilder('c')
            ->where('c.key = :key')
            ->setParameter('key', $key)
            ->orderBy('c.key', 'ASC')
            ->getQuery()
            ->getResult()
        ;

        $em->beginTransaction();

        if ($config) {

            try{
                $em->persist($config);
                $em->flush();
                $em->commit();
            } catch (\Exception $e) {
                $em->rollBack();
                throw $e;
            }
        }

        $em->close();
    }

}
