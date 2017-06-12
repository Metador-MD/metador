<?php

namespace Plugins\WhereGroup\MapBundle\EventListener;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\KernelInterface;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package Plugins\WhereGroup\MapBundle\EventListener
 */
class ApplicationListener
{
    public function __construct()
    {

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

            $rows = array('a' => 1, 'b' => 2);

            $app->add(
                $app->get('Configuration')
                    ->parameter('map_background', json_encode($rows, JSON_FORCE_OBJECT))
            );
        }
    }
}
