<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use WhereGroup\CoreBundle\Component\AjaxResponse;
use WhereGroup\CoreBundle\Component\Finder;
use WhereGroup\CoreBundle\Component\Search\SearchInterface;
use WhereGroup\CoreBundle\Entity\Configuration;
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
//        $params = $this->get('request_stack')->getCurrentRequest()->query->all();
//        $filter = new Finder();
//
//        $filter->public = true;
//
//        if ($this->get('security.authorization_checker')->isGranted('ROLE_SYSTEM_GEO_OFFICE')) {
//            $filter->geoOffice = true;
//            $filter->public = null;
//        }
//
//        $filter->page        = isset($params['page'])  ? $params['page']  : 1;
//        $filter->hits        = isset($params['hits'])  ? $params['hits']  : 10;
//        $filter->terms       = isset($params['terms']) ? $params['terms'] : '';
//        $filter->userEntries = isset($params['user_entries']) ? $params['user_entries'] : null;
//
//        /** @var UsernamePasswordToken $token */
//        $token = $this->get('security.token_storage')->getToken();
//
//        /** @var User $user */
//        $user = $token->getUser();
//
//        if (is_object($user)) {
//            $filter->userId = $user->getId();
//            $filter->public = null;
//        }
//
//        $metadata = $this->get('metador_metadata')->find($filter);
        $profileConfig = array();
        $sourceConfig  = array();

        foreach ($this->get('metador_plugin')->getActiveProfiles() as $key => $profile) {
            $configuration = $this->get('metador_configuration')->get('source', 'plugin', $key);

            $profileConfig[$key] = array(
                'name'   => $profile['name'],
                'source' => is_null($configuration) ? array() : $configuration
            );
        }

        foreach ($this->get('metador_source')->all() as $source) {
            $sourceConfigProfiles = array();

            foreach ($profileConfig as $key => $profile) {
                if (in_array($source->getSlug(), $profile['source'])) {
                    $sourceConfigProfiles[$key] = $profile['name'];
                }
            }

            $sourceConfig[$source->getSlug()] = array(
                'name' => $source->getName(),
                'profiles' => $sourceConfigProfiles
            );
        }

        return array(
            'isHome'       => true,
//            'rows'         => $metadata['result'],
//            'paging'       => $metadata['paging'],
//            'params'       => $params,
            'sourceConfig' => $sourceConfig
        );
    }

    /**
     * @Route("/search/", name="metador_search")
     */
    public function searchAction()
    {
        $params = $this->get('request_stack')->getCurrentRequest()->request->all();

        /** @var SearchInterface $search */
        $search = $this->get('metador_metadata_search');

        $search
            ->setPage(1)
            ->setHits(10)
            ->setTerms(isset($params['terms']) ? $params['terms'] : '')
            ->setSource(isset($params['source']) ? $params['source'] : '')
            ->find();

        $html = $this->get('templating')->render('@MetadorTheme/Home/result.html.twig', array(
            'rows'   => $search->getResult(),
            'paging' => $search->getResultPaging()
        ));

        return new AjaxResponse(array(
            'html'  => $html,
            'debug' => $params
        ));
    }

    /**
     * @Route("/heartbeat/", name="metador_heartbeat")
     * @Method("GET")
     */
    public function heartbeatAction()
    {
        return new AjaxResponse(array());
    }
}
