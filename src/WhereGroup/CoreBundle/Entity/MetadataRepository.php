<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\DBAL\Query\QueryBuilder;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\Query;
use Doctrine\ORM\Query\ResultSetMapping;
use WhereGroup\CoreBundle\Component\Finder;
use WhereGroup\CoreBundle\Component\Utils\Debug;

/**
 * Class MetadataRepository
 * @package WhereGroup\CoreBundle\Entity
 */
class MetadataRepository extends EntityRepository
{
    const ENTITY = 'MetadorCoreBundle:Metadata';

    /**
     * @param $profile
     * @return array
     */
    public function getAllByProfile($profile)
    {
        return $this->getEntityManager()->createQuery(
            "SELECT * FROM " . self::ENTITY . " p WHERE p.profile = :profile"
        )
        ->setParameter('profile', $profile)
        ->getResult();
    }

    /**
     * @param $id
     * @return bool|mixed
     */
    public function getDataObject($id)
    {
        $json = $this->getEntityManager()->createQuery(
            "SELECT p.object AS object FROM " . self::ENTITY . " p WHERE p.id = :id"
        )->setParameter('id', $id)->getResult();

        if (isset($json[0]['object'])) {
            $object = json_decode($json[0]['object'], true);

            if (is_array($object)) {
                return $object;
            }
        }

        return false;
    }

    /**
     * @param $source
     * @return int|mixed
     * @throws NonUniqueResultException
     */
    public function countBySource($source)
    {
        try {
            return $this
                ->getEntityManager()
                ->getRepository(self::ENTITY)
                ->createQueryBuilder('u')
                ->select('count(u.id)')
                ->where('u.source = :source')
                ->setParameter('source', $source)
                ->getQuery()
                ->getSingleScalarResult();
        } catch (NoResultException $e) {
            return 0;
        }
    }

    /**
     * @param $source
     * @return $this
     */
    public function deleteBySource($source)
    {
        $this
            ->getEntityManager()
            ->createQuery('delete from MetadorCoreBundle:Metadata u where u.source = :source')
            ->setParameter('source', $source)
            ->execute()
        ;

        return $this;
    }

    /**
     * @param Finder $finder
     * @return array
     */
    public function findByParams($finder)
    {
        $qb = $this
            ->createQueryBuilder('m')
            ->select('m');

        $finder->getFilter($qb);

        // Get Results
        return $qb->getQuery()->getResult();
    }

    /**
     * @return mixed
     * @throws \Doctrine\ORM\NonUniqueResultException
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
     * @return mixed
     */
    public function countAndGroupBySources()
    {
        return $this
            ->getEntityManager()
            ->getRepository(self::ENTITY)
            ->createQueryBuilder('u')
            ->select('u.source, count(u)')
            ->groupBy('u.source')
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * @param null $source
     * @return mixed
     */
    public function truncate($source = null)
    {
        $rsm = new ResultSetMapping();

        if (!is_null($source)) {
            $rows = $this
                ->getEntityManager('m')
                ->createQuery('SELECT m.id FROM ' . self::ENTITY . ' AS m WHERE m.source = :source')
                ->setParameter('source', $source)
                ->getResult();

            foreach ($rows as $row) {
                $this
                    ->getEntityManager()
                    ->createNativeQuery('DELETE FROM metadata_address WHERE metadata_id = :uuid', $rsm)
                    ->setParameter('uuid', $row['id'])
                    ->execute();
                $this
                    ->getEntityManager()
                    ->createNativeQuery('DELETE FROM metadata_groups WHERE metadata_id = :uuid', $rsm)
                    ->setParameter('uuid', $row['id'])
                    ->execute();
            }

            $this
                ->getEntityManager('m')
                ->createQuery('DELETE FROM ' . self::ENTITY . ' AS m WHERE m.source = :source')
                ->setParameter('source', $source)
                ->execute();

            return $this;
        }

        $this
            ->getEntityManager()
            ->createQuery('DELETE FROM ' . self::ENTITY)
            ->execute();

        $this
            ->getEntityManager()
            ->createNativeQuery('DELETE FROM metadata_address', $rsm)
            ->execute();

        $this
            ->getEntityManager()
            ->createNativeQuery('DELETE FROM metadata_groups', $rsm)
            ->execute();

        return $this;
    }
}
