<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use WhereGroup\CoreBundle\Component\Finder;

/**
 * @Route("/")
 */
class HomeController extends Controller
{
    /**
     * @Route("/", name="metador_home")
     * @Method("GET")
     * @Template("MetadorThemeBundle:Profile:index.html.twig")
     */
    public function indexAction()
    {
        $params = $this->get('request_stack')->getCurrentRequest()->query->all();
        $filter = new Finder();

        $filter->public = true;

        if ($this->get('security.authorization_checker')->isGranted('ROLE_SYSTEM_GEO_OFFICE')) {
            $filter->geoOffice = true;
            $filter->public = false;
        }

        $filter->page  = isset($params['page'])  ? $params['page']  : 1;
        $filter->hits  = isset($params['hits'])  ? $params['hits']  : 10;
        $filter->terms = isset($params['terms']) ? $params['terms'] : '';

        $metadata = $this->get('metadata')->find($filter);

        return array(
            'rows'    => $metadata['result'],
            'paging'  => $metadata['paging'],
            'params'  => $params
        );
    }
}
