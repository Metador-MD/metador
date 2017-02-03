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

    public function get($key, $filterType, $filterValue)
    {
        $config = $this->createQueryBuilder('c')
            ->where('c.key = :key')
            ->orWhere('c.filterType = :filterType')
            ->orWhere('c.filterValue = :filterValue')
            ->setParameter('key', $key)
            ->setParameter('filterType', $filterType)
            ->setParameter('filterValue', $filterValue)
            ->orderBy('c.key', 'ASC')
            ->getQuery()
            ->getResult()
        ;
        return $config;
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
                $em->flush();
                $em->commit();
            } catch (\Exception $e) {
                $em->rollBack();
                $em->close();
                throw $e;
            }
        }
        else{

            try{
                $em->persist(new Configuration($filterType, $filterValue, $key, $value));
                $em->flush();
                $em->commit();
            } catch (\Exception $e) {
                $em->rollBack();
                $em->close();
                throw $e;
            }
        }
    }

}
