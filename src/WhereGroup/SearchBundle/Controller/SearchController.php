<?php

namespace WhereGroup\SearchBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

use WhereGroup\MetadorBundle\Entity\Metadata;
use WhereGroup\MetadorBundle\Component\MetadorController;


/**
 * @Route("/search")
 */
class SearchController extends MetadorController
{
    /**
     * @Route("/", name="search")
     * @Template()
     */
    public function indexAction() {
        $page = $this->get('request')->get('page', 1);
        $limit = $this->get('request')->get('limit', 20);
        $searchterms = $this->get('request')->get('find', '');

        $qb = $this->get('doctrine')->getManager()->createQueryBuilder();

        $search = $this->container
                ->get('doctrine')
                ->getRepository('WhereGroupMetadorBundle:Metadata')
                ->createQueryBuilder('m')
                ->setFirstResult(($page * $limit) - $limit)
                ->setMaxResults($limit);
 
        // prepair searchterms
        foreach (array_filter(explode(' ' , $searchterms)) as $term)
            $search->andWhere(
                $qb->expr()->like(
                    'm.searchfield', 
                    $qb->expr()->literal('%' . $term . '%')
                )
            );
        
        // prepair permissions
        $user = $this->get('security.context')->getToken()->getUser();
        if(is_object($user)) {
            $roles = $user->getRoles();

            // TODO: more than one group?
            $search->andWhere($qb->expr()->orX(
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
        }

        $result = $search
                ->getQuery()
                ->getResult();

        for($i=0,$iL=count($result); $i<$iL; $i++)
            $result[$i]->setReadonly(
                $this->userHasAccess($result[$i]) ? 0 : 1
            );

        // die('<pre>' . print_r(count($result), 1) . '</pre>');
        // if (false === $this->get('security.context')->isGranted('ROLE_METADOR_ADMIN'))
        //     throw new AccessDeniedException();
        // $user = $this->get('security.context')->getToken()->getUser();

        // echo get_class($user);

        // if(is_object($user)) {
        //     $roles = $user->getRoles();
        // } else {

        // }

        return array(
            'find' => $searchterms,
            'page' => $page,
            'limit' => $limit,
            'result' => $result
        );       
    }
}