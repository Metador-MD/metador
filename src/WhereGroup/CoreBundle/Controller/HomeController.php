<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Twig\Error\Error;
use WhereGroup\CoreBundle\Component\AjaxResponse;
use WhereGroup\CoreBundle\Component\CsvResponse;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Component\Search\JsonFilterReader;
use WhereGroup\CoreBundle\Component\Search\PropertyNameNotFoundException;
use WhereGroup\CoreBundle\Component\Search\Search;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;

/**
 * @Route("/")
 */
class HomeController extends Controller
{
    /**
     * @Route("/", name="metador_home", methods={"GET"})
     */
    public function indexAction()
    {
        return $this->render("MetadorThemeBundle:Home:index.html.twig", [
            'isHome'         => true,
            'sourceConfig'   => $this->getSourceConfiguration(),
            'hierarchyLevel' => $this
                ->get('metador_configuration')
                ->get('hierarchy_levels', 'plugin', 'metador_core')
        ]);
    }

    /**
     * @Route("/public/search/", name="metador_search")
     * @throws Error
     * @throws PropertyNameNotFoundException
     */
    public function searchAction()
    {
        $request  = $this->get('request_stack')->getCurrentRequest();
        $download = $request->request->get('filter');
        $params   = $request->request->all();
        $response = [];

        /** @var Search $search */
        $search = $this->get('metador_metadata_search');
        $search->setParmeters($params);

        if (!is_null($download)) {
            $params = json_decode(base64_decode($download), true);
        }

        $user = $this->get('metador_user')->getUserFromSession();
        $filter = [];

        if (isset($params['sort'])) {
            $search->setSort(
                empty($params['sort']) ? 'title' : $params['sort']
            );
        }

        // Set source filter
        if (isset($params['source']) && !empty($params['source'])) {
            $filter['and'][] = ['eq' => ['source' => $params['source']]];
        }

        // Set public filter if user is not logged in.
        if (is_null($user)) {
            $filter['and'][] = ['eq' => ['public' => true]];

        // Filter for logged in user.
        } elseif ($user->getUsername() !== 'root') {
            $search->setGroups($user->getRoles());
            $orx = [
                ['eq' => ['public'         => true]],
                ['eq' => ['insertUsername' => $user->getUsername()]],
            ];

            if (!empty($user->getNonSystemRoles())) {
                $orx[] = ['in' => ['role' => $user->getNonSystemRoles()]];
            }

            $filter['and'][] = ['or' => $orx];
        }

        if (isset($params['hierarchyLevel'])
            && is_array($params['hierarchyLevel']) && !empty($params['hierarchyLevel'])) {
            $subfilter = [];

            foreach ($params['hierarchyLevel'] as $key => $value) {
                if ($value !== 'true') {
                    continue;
                }
                $subfilter['or'][] = ['eq' => ['hierarchyLevel' => $key]];
            }

            if (isset($subfilter['or'])) {
                $filter['and'][] = $subfilter;
            }

            unset($subfilter);
        }

        if (isset($params['topicCategory']) && is_array($params['topicCategory']) && !empty($params['topicCategory'])) {
            foreach ($params['topicCategory'] as $key => $value) {
                if (!empty($value)) {
                    continue;
                }
                $filter['and'][] = ['neq' => ['topicCategory' => $key]];
            }
        }

        // Set spatial filter
        if (isset($params['spatial']) && $params['spatial']) {
            $filter['and'][] = $params['spatial'];
        }

        // Set date filter
        if (isset($params['date']) && !empty($params['date']['from'])) {
            $filter['and'][] = ['gte' => ['date' => $params['date']['from']]];
        }

        if (isset($params['date']) && !empty($params['date']['to'])) {
            $filter['and'][] = ['lte' => ['date' => $params['date']['to']]];
        }

        $expression = JsonFilterReader::read($filter, $search->createExpression());

        $search
            ->setTerms(isset($params['terms']) ? $params['terms'] : '')
            ->setExpression($expression);

        if (is_null($download)) {
            $search
                ->setPage(isset($params['page']) ? $params['page'] : 1)
                ->setHits(
                    $this
                        ->get('metador_configuration')
                        ->get('search_hits', 'plugin', 'metador_core', 10)
                );
        }

        try {
            $searchResponse = $search->find();
        } catch (MetadataException $e) {
            $this->get('metador_frontend_command')->displayError($response, $e->getMessage());
            return new AjaxResponse($response);
        }

        if (!is_null($download)) {
            return new CsvResponse(
                $this->get('metador_csv_export')->buildCsvArray(
                    isset($searchResponse['rows']) ? $searchResponse['rows'] : []
                )
            );
        }

        $response = [];

        $this
            ->renderTemplate($response, $searchResponse, $params)
            ->addBboxFrontendCommand($response, $searchResponse['rows']);

        return new AjaxResponse($response);
    }

    /**
     * @param $response
     * @param $searchResponse
     * @param $params
     * @return $this
     * @throws Error
     */
    protected function renderTemplate(&$response, $searchResponse, $params)
    {
        $response = array_merge($response, [
            'html' => $this->get('templating')->render('@MetadorTheme/Home/result.html.twig', [
                'rows'   => $searchResponse['rows'],
                'paging' => $searchResponse['paging'],
            ]),
            'debug' => $params
        ]);

        return $this;
    }

    /**
     * @param $response
     * @param $rows
     * @return $this
     */
    protected function addBboxFrontendCommand(&$response, $rows)
    {
        $bboxParams = [];

        if (!empty($rows)) {
            foreach ($rows as $result) {
                if (!isset($result['object'])) {
                    continue;
                }

                $p = json_decode($result['object'], true);

                if (!$p) {
                    continue;
                }

                $bbox = ArrayParser::get($p, 'bbox', null, true);

                if (isset($p['_uuid']) && !empty($p['_uuid']) &&
                    isset($p['title']) && !empty($p['title']) &&
                    isset($bbox['wLongitude']) && !empty($bbox['wLongitude']) &&
                    isset($bbox['sLatitude']) && !empty($bbox['sLatitude']) &&
                    isset($bbox['eLongitude']) && !empty($bbox['eLongitude']) &&
                    isset($bbox['nLatitude']) && !empty($bbox['nLatitude'])) {
                    $bboxParams[] = [
                        'uuid' => $p['_uuid'],
                        'title' => $p['title'],
                        'west' => $bbox['wLongitude'],
                        'south' => $bbox['sLatitude'],
                        'east' => $bbox['eLongitude'],
                        'north' => $bbox['nLatitude'],
                    ];
                }
            }
        }

        $activePlugins = $this->get('metador_plugin')->getActivePlugins();

        if (isset($activePlugins['metador_map'])) {
            $this->get('metador_frontend_command')->runMethod(
                'MetadorOl4Bridge',
                'showResults',
                $bboxParams,
                $response
            );
        }

        return $this;
    }

    /**
     * @return array
     */
    protected function getSourceConfiguration()
    {
        $profileConfig = $this->getPluginConfiguration();
        $sourceConfig  = [];

        foreach ($this->get('metador_source')->all() as $source) {
            $sourceConfigProfiles = [];

            foreach ($profileConfig as $key => $profile) {
                if (is_array($profile['source']) && in_array($source->getSlug(), $profile['source'])) {
                    $sourceConfigProfiles[$key] = $profile['name'];
                }
            }

            $sourceConfig[$source->getSlug()] = [
                'name' => $source->getName(),
                'profiles' => $sourceConfigProfiles,
            ];
        }

        return $sourceConfig;
    }

    /**
     * @return array
     */
    protected function getPluginConfiguration()
    {
        $profileConfig = [];

        foreach ($this->get('metador_plugin')->getActiveProfiles() as $key => $profile) {
            $configuration = $this->get('metador_configuration')->get('source', 'plugin', $key);

            $profileConfig[$key] = [
                'name'   => $profile['name'],
                'source' => is_null($configuration) ? [] : $configuration,
            ];
        }

        return $profileConfig;
    }

    /**
     * @Route("/heartbeat", name="metador_heartbeat", methods={"GET"})
     */
    public function heartbeatAction()
    {
        return new AjaxResponse([]);
    }
}
