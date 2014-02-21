<?php

namespace WhereGroup\SearchBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

use WhereGroup\SearchBundle\Component\Paging;

/**
 * @Route("/search")
 */
class SearchController extends Controller
{
    /**
     * @Route("/", name="search")
     * @Template()
     */
    public function indexAction() {
        $page = $this->get('request')->get('page', 1);
        $limit = $this->get('request')->get('limit', 4);
        $searchterms = $this->get('request')->get('find', '');
        $metadorUser = $this->get('metador_user');
        $qb = $this->get('doctrine')->getManager()->createQueryBuilder();

        $searchCount = $this->container
                ->get('doctrine')
                ->getRepository('WhereGroupMetadorBundle:Metadata')
                ->createQueryBuilder('m')
                ->select('count(m.id)');

        $search = $this->container
                ->get('doctrine')
                ->getRepository('WhereGroupMetadorBundle:Metadata')
                ->createQueryBuilder('m')
                ->setFirstResult(($page * $limit) - $limit)
                ->setMaxResults($limit);
 
        // prepair searchterms
        foreach (array_filter(explode(' ' , $searchterms)) as $term) {
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
        $user = $metadorUser->getUser();

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

        for($i=0,$iL=count($result); $i<$iL; $i++)
            $result[$i]->setReadonly(!$metadorUser->checkMetadataAccess($result[$i]));

        $paging = new Paging($count, $limit, $page);

        return array(
            'find' => $searchterms,
            'page' => $page,
            'limit' => $limit,
            'result' => $result,
            'paging' => $paging->calculate()
        );       
    }
}