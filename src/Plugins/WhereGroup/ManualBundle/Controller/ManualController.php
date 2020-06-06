<?php

namespace Plugins\WhereGroup\ManualBundle\Controller;

use Plugins\WhereGroup\ManualBundle\Event\ManualEvent;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/public/manual")
 */
class ManualController extends Controller
{
    /**
     * @Route("/{manual}", name="manual_index", methods={"GET"})
     * @param string $manual
     * @return Response
     */
    public function indexAction($manual = 'Anwenderhandbuch')
    {
        $event = new ManualEvent();
        $event
            ->setEnvironment($this->get('kernel')->getEnvironment())
            ->setAuthorizationChecker($this->get('security.authorization_checker'))
            ->setManualType($manual)
        ;

        $this->get('event_dispatcher')->dispatch('manual.loading', $event);

        return $this->render('@MetadorManual/Manual/index.html.twig', [
            'manual' => $manual,
            'index'  => $event->getIndex($manual)
        ]);
    }

    /**
     * @Route("/{manual}/{plugin}/{page}", name="manual_page", methods={"GET"})
     * @param $manual
     * @param $plugin
     * @param $page
     * @return Response
     */
    public function pageAction($manual, $plugin, $page)
    {
        return $this->render('@' . $plugin . '/Manual/' . $page . '.html.twig', [
            'manual' => $manual
        ]);
    }
}
