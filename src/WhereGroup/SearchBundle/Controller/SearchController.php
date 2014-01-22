<?php

namespace WhereGroup\SearchBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

// use WhereGroup\MetadorBundle\Event\MetadataChangeEvent;
// use WhereGroup\MetadorBundle\Entity\Metadata;
// use WhereGroup\MetadorBundle\Entity\Address;
// use WhereGroup\MetadorBundle\Component\MetadorController;
// use WhereGroup\MetadorBundle\Component\MetadorDocument;

/**
 * @Route("/search")
 */
class SearchController extends Controller
{
    /**
     * @Route("/")
     * Template()
     */
    public function indexAction() {
        // if (false === $this->get('security.context')->isGranted('ROLE_METADOR_ADMIN'))
        //     throw new AccessDeniedException();
        $user = $this->get('security.context')->getToken()->getUser();

        echo get_class($user);

        if(is_object($user)) {
            $roles = $user->getRoles();
        } else {

        }

        die;
        return array();       
    }
}