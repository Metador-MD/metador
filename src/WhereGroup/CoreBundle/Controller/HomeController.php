<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;


/**
 * @Route("/")
 */
class HomeController extends Controller
{
    /**
     * @Route("/", name="metador_home")
     * @Method("GET")
     * @Template("MetadorThemeBundle:Home:index.html.twig")
     */
    public function indexAction()
    {
        $queryParams = $this->get('request_stack')->getCurrentRequest()->query->all();

        $params = array_merge($queryParams, array(

        ));

        if (!$this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            $params = array_merge($queryParams, array(
                'public' => 1
            ));
        }

        if (!isset($params['page'])) {
            $params['page'] = 1;
        }

        $metadata = $this->get('metadata')->find($params);

        return array(
            'rows'    => $metadata['result'],
            'paging'  => $metadata['paging'],
            'params'  => $params
        );
    }
}
