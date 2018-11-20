<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use WhereGroup\CoreBundle\Component\AjaxResponse;

/**
 * @Route("/profile")
 */
class ProfileController extends Controller
{
    /**
     * @Route("/operateson", name="operateson_info")
     * @Method("GET")
     */
    public function operatesOnAction()
    {
        $request  = $this->get('request_stack')->getCurrentRequest();
        $search   = $this->get('metador_metadata_search');
        $hits    = $this
            ->get('metador_configuration')
            ->get('popup_search_hits', 'plugin', 'metador_core', 5);

        $response = $search
            ->setPage($request->get('page'))
            ->setHits($hits)
            ->setSource($request->get('source'))
            ->setProfile(['metador_dataset_profile'])
            ->setTerms($request->get('terms'))
            ->find()
        ;

        return new AjaxResponse([
            'data' => [],
            'html' => $this->renderView('@MetadorBasicProfile/Profile/operates-on.html.twig', $response)
        ]);
    }
}
