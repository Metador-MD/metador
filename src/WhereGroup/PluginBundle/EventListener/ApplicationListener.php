<?php

namespace WhereGroup\PluginBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package WhereGroup\PluginBundle\EventListener
 */
class ApplicationListener
{
    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $app->add(
            $app->get('AdminMenu', 'plugin')
                ->icon('icon-puzzle-piece')
                ->label('Plugins')
                ->path('metador_admin_plugin')
                ->active($app->isBundle('plugin'))
                ->setRole('ROLE_SYSTEM_SUPERUSER')
        );
    }
}
