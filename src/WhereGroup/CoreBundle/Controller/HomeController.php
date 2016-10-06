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
     * @Template("MetadorThemeBundle:Home:index.html.twig")
     */
    public function indexAction()
    {
        $params = $this->get('request_stack')->getCurrentRequest()->query->all();
        $filter = new Finder();

        if (!$this->get('security.authorization_checker')->isGranted('ROLE_SYSTEM_USER')) {
            $filter->public = true;
        }

        if (!isset($params['page'])) {
            $filter->page = 1;
            $filter->hits = 10;
        }

        $metadata = $this->get('metadata')->find($filter);

        return array(
            'rows'    => $metadata['result'],
            'paging'  => $metadata['paging'],
            'params'  => $params
        );
    }
}
