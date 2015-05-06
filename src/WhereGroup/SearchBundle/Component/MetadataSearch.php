<?php

namespace WhereGroup\SearchBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface as Container;
use WhereGroup\CoreBundle\Component\MetadorUserInterface;

class MetadataSearch {
    private $container;
    protected $metadorUser;

    public function __construct(
        Container $container,
        MetadorUserInterface $metadorUser) {
        $this->container = $container;
        $this->metadorUser = $metadorUser;
    }

    public function find() {
        $params = array(
            'page'          => $this->container->get('request')->get('page', 1),
            'limit'         => $this->container->get('request')->get('limit', 5),
            'searchterm'    => $this->container->get('request')->get('searchterm', ''),
            'filter-dataset'=> $this->container->get('request')->get('filter-dataset', 1),
            'filter-service'=> $this->container->get('request')->get('filter-service', 1),
            'filter-series' => $this->container->get('request')->get('filter-series', 1)
        );

        $params['limit'] = $params['limit'] > 0 ? $params['limit'] : 1;
        $params['page'] = $params['page'] > 0 ? $params['page'] : 1;

        $qb = $this->container
            ->get('doctrine')
            ->getManager()
            ->createQueryBuilder();

        $searchCount = $this->container
                ->get('doctrine')
                ->getRepository('WhereGroupCoreBundle:Metadata')
                ->createQueryBuilder('m')
                ->select('count(m.id)');

        $search = $this->container
                ->get('doctrine')
                ->getRepository('WhereGroupCoreBundle:Metadata')
                ->createQueryBuilder('m')
                ->setFirstResult(($params['page'] * $params['limit']) - $params['limit'])
                ->setMaxResults($params['limit']);

        // prepair searchterms
        foreach (array_filter(explode(' ' , $params['searchterm'])) as $term) {
            $term = trim(strtolower($term));

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

        // prepair permissions
        $user = $this->container->get('security.context')->getToken()->getUser();

        if(is_object($user)) {
            $roles = $user->getRoles();

            $orx = $qb->expr()->orX();

            foreach ($roles as $role) {
                if ($role === 'ROLE_USER') continue;
                $orx->add($qb->expr()->like('m.groups', $qb->expr()->literal('%' . $role . '%')));
            }

            $orx->add($qb->expr()->eq('m.public', ':public'));

            $search
                ->andWhere($orx)
                ->setParameter('public', true);

            $searchCount
                ->andWhere($orx)
                ->setParameter('public', true);

            unset($orx);
        } else {
            $search->andWhere(
                $qb->expr()->eq('m.public', ':public')
            )->setParameter('public', true);

            $searchCount->andWhere(
                $qb->expr()->eq('m.public', ':public')
            )->setParameter('public', true);
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
