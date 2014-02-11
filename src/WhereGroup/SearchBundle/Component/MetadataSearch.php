<?php

namespace WhereGroup\SearchBundle\Component;

class MetadataSearch {
    private $container;

    public function __construct($container) {
        $this->container = $container;
    }

    public function find(array $params) {
        $qb = $this->container
            ->get('doctrine')
            ->getManager()
            ->createQueryBuilder();

        $searchCount = $this->container
                ->get('doctrine')
                ->getRepository('WhereGroupMetadorBundle:Metadata')
                ->createQueryBuilder('m')
                ->select('count(m.id)');

        $search = $this->container
                ->get('doctrine')
                ->getRepository('WhereGroupMetadorBundle:Metadata')
                ->createQueryBuilder('m')
                ->setFirstResult(($params['page'] * $params['limit']) - $params['limit'])
                ->setMaxResults($params['limit']);
 
        // prepair searchterms
        foreach (array_filter(explode(' ' , $params['searchterm'])) as $term) {
            $search->andWhere(
                $qb->expr()->like(
                    'm.searchfield', 
                    $qb->expr()->literal('%' . $term . '%')
                )
            );

            $searchCount->andWhere(
                $qb->expr()->like(
                    'm.searchfield', 
                    $qb->expr()->literal('%' . $term . '%')
                )
            );
        }

        // prepair permissions
        $user = $this->container->get('security.context')->getToken()->getUser();

        if(is_object($user)) {
            $roles = $user->getRoles();

            // TODO: more than one group?
            $search->andWhere($qb->expr()->orX(
                $qb->expr()->eq('m.groups', ':roles'),
                $qb->expr()->eq('m.public', '1')
            ))->setParameter('roles', implode(',', $roles));

            $searchCount->andWhere($qb->expr()->orX(
                $qb->expr()->eq('m.groups', ':roles'),
                $qb->expr()->eq('m.public', '1')
            ))->setParameter('roles', implode(',', $roles));

            // Ugly fix if you have more than one group.
            // $qb->expr()->like('m.groups', 
            //     $qb->expr()->literal('%' . implode(',', $roles) . '%')),     
        } else {
            $search->andWhere(
                $qb->expr()->eq('m.public', '1')
            );

            $searchCount->andWhere(
                $qb->expr()->eq('m.public', '1')
            );
        }

        $result = $search
            ->getQuery()
            ->getResult();

        $count = (int)$searchCount
            ->getQuery()
            ->getSingleScalarResult();

        $paging = new Paging($count, $params['limit'], $params['page']);

        return array(
            'find'   => $params['searchterm'],
            'limit'  => $params['limit'],
            'result' => $result,
            'paging' => $paging->calculate()
        );
    }
}