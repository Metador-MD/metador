<?php

namespace WhereGroup\CoreBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

class ApplicationListener
{
    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $app->add(
            $app->get('GlobalMenu', 'dashboard')
                ->icon('icon-meter')
                ->label('Dashboard')
                ->path('metador_dashboard')
        )->add(
            $app->get('GlobalMenu', 'admin')
                ->icon('icon-cog')
                ->label('Administration')
                ->path('metador_admin_index')
                ->active($app->routeStartsWith('metador_admin'))
                ->setRole('ROLE_SUPERUSER')
        )->add(
            $app->get('AdminMenu', 'index')
                ->icon('icon-eye')
                ->label('Übersicht')
                ->path('metador_admin_index')
                ->setRole('ROLE_SUPERUSER')
        );
    }
}
