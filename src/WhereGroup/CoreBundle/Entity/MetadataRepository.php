<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\DBAL\Query\QueryBuilder;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use WhereGroup\CoreBundle\Component\Finder;

/**
 * Class MetadataRepository
 * @package WhereGroup\CoreBundle\Entity
 */
class MetadataRepository extends EntityRepository
{
    private $entity = 'MetadorCoreBundle:Metadata';

    /**
     * @param $profile
     * @return array
     */
    public function getAllByProfile($profile)
    {
        return $this->getEntityManager()->createQuery(
            "SELECT * FROM $this->entity p WHERE p.profile = :profile"
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
            "SELECT p.object AS object FROM $this->entity p WHERE p.id = :id"
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
     * @param Finder $finder
     * @return mixed
     */
    public function count($finder)
    {
        $qb = $this->createQueryBuilder('m');

        $qb->select($qb->expr()->count('m'));

        $finder->getFilter($qb, true);

        return $qb->getQuery()->getSingleScalarResult();
    }
}
