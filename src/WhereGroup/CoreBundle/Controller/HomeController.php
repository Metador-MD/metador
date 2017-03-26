<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use WhereGroup\CoreBundle\Component\Finder;
use WhereGroup\UserBundle\Entity\User;

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

        $filter->public = true;

        if ($this->get('security.authorization_checker')->isGranted('ROLE_SYSTEM_GEO_OFFICE')) {
            $filter->geoOffice = true;
            $filter->public = null;
        }

        $filter->page        = isset($params['page'])  ? $params['page']  : 1;
        $filter->hits        = isset($params['hits'])  ? $params['hits']  : 10;
        $filter->terms       = isset($params['terms']) ? $params['terms'] : '';
        $filter->userEntries = isset($params['user_entries']) ? $params['user_entries'] : null;

        /** @var UsernamePasswordToken $token */
        $token = $this->get('security.token_storage')->getToken();

        /** @var User $user */
        $user = $token->getUser();

        if (is_object($user)) {
            $filter->userId = $user->getId();
            $filter->public = null;
        }

        $metadata = $this->get('metadata')->find($filter);

        return array(
            'rows'         => $metadata['result'],
            'paging'       => $metadata['paging'],
            'params'       => $params
        );
    }
}
