<?php

namespace Plugins\WhereGroup\ManualBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package Plugins\WhereGroup\ManualBundle\EventListener
 */
class ApplicationListener
{
    /**
     * @param ApplicationEvent $event
     * @throws \Exception
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $app->add(
            $app->get('GlobalMenu', 'book')
                ->icon('icon-book')
                ->label('')
                ->title('Handbuch')
                ->path('manual')
                ->active($app->routeStartsWith('manual'))
        );

        if ($app->routeStartsWith('manual')) {
            $app
                ->prepend(
                    $app->get('ManualMenu', 'index')
                        ->icon('icon-home')
                        ->label('Benutzerhandbuch')
                        ->path('manual')
                )
                ->prepend(
                    $app->get('ManualMenu', 'user')
                        ->icon('icon-user')
                        ->label('Benutzer/Gruppen')
                        ->path('manual_user')
                        ->setRole('ROLE_SYSTEM_SUPERUSER')
                )
                ->prepend(
                    $app->get('ManualMenu', 'metadata')
                        ->icon('icon-file-text')
                        ->label('Metadaten')
                        ->path('manual_metadata')
                        ->setRole('ROLE_SYSTEM_USER')
                )
                ->prepend(
                    $app->get('ManualMenu', 'plugin')
                        ->icon('icon-puzzle-piece')
                        ->label('Plugins')
                        ->path('manual_plugin')
                        ->setRole('ROLE_SYSTEM_SUPERUSER')
                )
            ;
        }
    }
}
