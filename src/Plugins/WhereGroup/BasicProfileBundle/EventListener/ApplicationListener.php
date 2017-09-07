<?php

namespace Plugins\WhereGroup\BasicProfileBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package Plugins\WhereGroup\BasicProfileBundle\EventListener
 */
class ApplicationListener
{
    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        if ($app->routeStartsWith('metador_admin')) {
            $app->add(
                $app->get('AdminMenu', 'lists')
                    ->icon('icon-file-text')
                    ->label('Auswahllisten')
                    ->path('metador_admin_lists')
                    ->setRole('ROLE_SYSTEM_GEO_OFFICE')
                    ->active($app->routeStartsWith('metador_admin_lists'))
            )->add(
                $app->get('AdminMenu', 'metador_admin_keyword')
                    ->icon('icon-tags')
                    ->label('Schlüsselwörter')
                    ->path('metador_admin_keyword')
                    ->setRole('ROLE_SYSTEM_GEO_OFFICE')
                    ->active($app->routeStartsWith('metador_admin_keyword'))
            );
        }
    }
}
