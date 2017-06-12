<?php

namespace Plugins\WhereGroup\MapBundle\EventListener;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\KernelInterface;
use Doctrine\ORM\EntityManagerInterface;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package Plugins\WhereGroup\MapBundle\EventListener
 */
class ApplicationListener
{
    /** @var \Doctrine\Common\Persistence\ObjectRepository|null|\Plugins\WhereGroup\MapBundle\Entity\WmsRepository */
    protected $repo = null;

    const ENTITY = "MetadorMapBundle:Wms";

    /** @param EntityManagerInterface $em */
    public function __construct(EntityManagerInterface $em)
    {
        $this->repo = $em->getRepository(self::ENTITY);
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        if ($app->routeStartsWith('metador_admin')) {
            $app->add(
                $app->get('AdminMenu', 'map')
                    ->icon('icon-map')
                    ->label('Hintergrundkarte')
                    ->path('metador_admin_map')
                    ->setRole('ROLE_SYSTEM_GEO_OFFICE')
                    ->active($app->routeStartsWith('metador_admin_map'))
            );
        }

        if ($app->isRoute('metador_home')) {
            $app->add(
                $app->get('Configuration')
                    ->parameter('map_background', json_encode($this->repo->all(), JSON_FORCE_OBJECT))
            );
        }
    }
}
