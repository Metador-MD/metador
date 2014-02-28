<?php

namespace WhereGroup\SearchBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface as Container;
use WhereGroup\MetadorBundle\Component\MetadorUserInterface;

class MetadataSearch {
    private $container;
    protected $metadorUser;

    public function __construct(
        Container $container,
        MetadorUserInterface $metadorUser) {
        $this->container = $container;
        $this->metadorUser = $metadorUser;
    }

    public function find(array $params) {
        $params['limit'] = $params['limit'] > 0 ? $params['limit'] : 1;
        $params['page'] = $params['page'] > 0 ? $params['page'] : 1;

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

        $orx = $qb->expr()->orx();

        if (!empty($params['filter-dataset'])) {
            $orx->add($qb->expr()->eq('m.hierarchyLevel', ':dataset'));
            $search->setParameter('dataset', 'dataset');
            $searchCount->setParameter('dataset', 'dataset');
        }
        
        if (!empty($params['filter-service'])) {
            $orx->add($qb->expr()->eq('m.hierarchyLevel', ':service'));
            $search->setParameter('service', 'service');
            $searchCount->setParameter('service', 'service');
        }
        
        if (!empty($params['filter-series'])) {
            $orx->add($qb->expr()->eq('m.hierarchyLevel', ':series'));
            $search->setParameter('series', 'series');
            $searchCount->setParameter('series', 'series');
        }
        
        $search->andWhere($orx);
        $searchCount->andWhere($orx);

/*
        // TODO: fertig machen.
        if (!empty($params['filter-dataset']) && empty($params['filter-service'])) {
            $search
                ->andWhere($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', ':hierarchylevel1'),
                    $qb->expr()->eq('m.hierarchyLevel', ':hierarchylevel2')
                ))->setParameters(array(
                    'hierarchylevel1' => 'dataset',
                    'hierarchylevel2' => 'series',
                ));

            $searchCount
                ->andWhere($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', ':hierarchylevel1'),
                    $qb->expr()->eq('m.hierarchyLevel', ':hierarchylevel2')
                ))->setParameters(array(
                    'hierarchylevel1' => 'dataset',
                    'hierarchylevel2' => 'series',
                ));

        } else if (!empty($params['filter-service']) && empty($params['filter-dataset'])) {
            $search
                ->andWhere($qb->expr()->eq('m.hierarchyLevel', ':hierarchylevel'))
                ->setParameters(array('hierarchylevel' => 'service'));
            $searchCount
                ->andWhere($qb->expr()->eq('m.hierarchyLevel', ':hierarchylevel'))
                ->setParameters(array('hierarchylevel' => 'service'));            
        } else if (empty($params['filter-service']) && empty($params['filter-dataset'])) {
            $search
                ->andWhere($qb->expr()->eq('m.hierarchyLevel', ':hierarchylevel'))
                ->setParameters(array('hierarchylevel' => 'series'));
            $searchCount
                ->andWhere($qb->expr()->eq('m.hierarchyLevel', ':hierarchylevel'))
                ->setParameters(array('hierarchylevel' => 'series'));            
        }

*/
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

        for($i=0,$iL=count($result); $i<$iL; $i++)
            $result[$i]->setReadonly(!$this->metadorUser->checkMetadataAccess($result[$i]));

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