<?php

namespace WhereGroup\CoreBundle\Controller;

use Doctrine\ORM\NoResultException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use WhereGroup\CoreBundle\Component\AjaxResponse;
use WhereGroup\CoreBundle\Component\Finder;
use WhereGroup\CoreBundle\Component\Search\JsonFilterReader;
use WhereGroup\CoreBundle\Component\Search\Search;
use WhereGroup\CoreBundle\Component\Search\SearchInterface;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;
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
        $profileConfig = array();
        $sourceConfig = array();

        foreach ($this->get('metador_plugin')->getActiveProfiles() as $key => $profile) {
            $configuration = $this->get('metador_configuration')->get('source', 'plugin', $key);

            $profileConfig[$key] = array(
                'name'   => $profile['name'],
                'source' => is_null($configuration) ? array() : $configuration,
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
                'name'     => $source->getName(),
                'profiles' => $sourceConfigProfiles,
            );
        }

        return array(
            'isHome'       => true,
            'sourceConfig' => $sourceConfig,
        );
    }

    /**
     * @Route("/public/search/", name="metador_search")
     */
    public function searchAction()
    {
        $params = $this->get('request_stack')->getCurrentRequest()->request->all();

        /** @var Search $search */
        $search = $this->get('metador_metadata_search');
        $search
            ->setPage(isset($params['page']) ? $params['page'] : 1)
            ->setHits(isset($params['hits']) ? $params['hits'] : 10)
            ->setTerms(isset($params['terms']) ? $params['terms'] : '')
            ->setSource(isset($params['source']) ? $params['source'] : '');

        if (isset($params['spatial']) && $params['spatial']) {
            $search->setExpression(JsonFilterReader::read($params['spatial'], $search->createExpression()));
        }

        try {
            $searchResponse = $search->find();
        } catch (NoResultException $e) {
            $searchResponse = [];
        }

        $response = [
            'html' => $this->get('templating')->render('@MetadorTheme/Home/result.html.twig', array(
                'rows'   => $searchResponse['rows'],
                'paging' => $searchResponse['paging'],
            )),
            'debug' => $params,
        ];

        $bboxParams = [];

        if (!empty($results)) {
            foreach ($results as $result) {
                if (!isset($result['object'])) {
                    continue;
                }

                $p = json_decode($result['object'], true);

                if (!$p) {
                    continue;
                }

                $bbox = ArrayParser::get($p, 'bbox:0', null, true);

                if (isset($p['_uuid']) && !empty($p['_uuid']) &&
                    isset($p['title']) && !empty($p['title']) &&
                    isset($bbox['wLongitude']) && !empty($bbox['wLongitude']) &&
                    isset($bbox['sLatitude'])  && !empty($bbox['sLatitude']) &&
                    isset($bbox['eLongitude']) && !empty($bbox['eLongitude']) &&
                    isset($bbox['nLatitude'])  && !empty($bbox['nLatitude'])) {
                    $bboxParams[] = [
                        'uuid'  => $p['_uuid'],
                        'title' => $p['title'],
                        'west'  => $bbox['wLongitude'],
                        'south' => $bbox['sLatitude'],
                        'east'  => $bbox['eLongitude'],
                        'north' => $bbox['nLatitude']
                    ];
                }
            }
        }

        $this->get('metador_frontend_command')->runMethod(
            'MetadorOl4Bridge',
            'showResults',
            $bboxParams,
            $response
        );

        return new AjaxResponse($response);
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
