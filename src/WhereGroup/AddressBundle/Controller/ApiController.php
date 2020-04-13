<?php

namespace WhereGroup\AddressBundle\Controller;

use Doctrine\ORM\NonUniqueResultException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use WhereGroup\CoreBundle\Component\AjaxResponse;

/**
 * @Route("/address/api")
 */
class ApiController extends Controller
{
    /**
     * @Route("/all", name="metador_address_api_all")
     * @param Request $request
     * @return AjaxResponse
     * @throws NonUniqueResultException
     */
    public function allAction(Request $request)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');

        $result = $this->get('metador_address')->search(
            $request->get('terms'),
            $request->get('page'),
            $this
                ->get('metador_configuration')
                ->get('popup_search_hits', 'plugin', 'metador_core', 5)
        );

        return new AjaxResponse([
            'data' => $result['rows'],
            'html' => $this->renderView('MetadorAddressBundle:Api:all.html.twig', $result)
        ]);
    }
}
