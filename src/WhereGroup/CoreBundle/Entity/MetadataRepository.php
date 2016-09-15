<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\DBAL\Query\QueryBuilder;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;

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
     * @param $params
     * @return array
     */
    public function findByParams($params)
    {
        $qb = $this
            ->createQueryBuilder('m')
            ->select('m');

        $this->prepairFindByParams($qb, $params);

        // Get Results
        return $qb->getQuery()->getResult();
    }

    /**
     * @param $params
     * @return mixed
     */
    public function count($params)
    {
        $qb = $this->createQueryBuilder('m');
        $qb->select($qb->expr()->count('m'));

        $this->prepairFindByParams($qb, $params, true);

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @param $qb
     * @param $params
     * @param bool $count
     */
    private function prepairFindByParams($qb, $params, $count = false)
    {
        // Set limit and offset
        if ($count === false && (isset($params['page']) || isset($params['hits']))) {
            $params['page'] = isset($params['page']) ? (int)$params['page'] : 1;
            $params['hits'] = isset($params['hits']) ? (int)$params['hits'] : 10;

            $qb
                ->setFirstResult($params['page'] * $params['hits'] - $params['hits'])
                ->setMaxResults($params['hits']);
        }

        // Set order by
        if ($count === false && (isset($params['order']) && !is_null($params['order']))) {
            $qb
                ->orderBy("m." . $params['order'], 'ASC');
        }

        // Find with like
        if (isset($params['terms']) && !is_null($params['terms'])) {
            foreach (explode(" ", $params['terms']) as $term) {
                $qb
                    ->andWhere('m.searchfield LIKE :term')
                    ->setParameter('term', "%" . $term . "%");
            }
        }

        // Filter: Profile
        if (isset($params['profile']) && !is_null($params['profile'])) {
            $qb
                ->andWhere('m.profile = :profile')
                ->setParameter('profile', $params['profile']);
        }

        // Filter: Public
        if (isset($params['public'])) {
            $qb
                ->andWhere('m.public = :public')
                ->setParameter('public', $params['public']);
        }
    }
}
