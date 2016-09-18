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
                ->icon('icon-power-cord')
                ->label('Plugins')
                ->path('metador_admin_plugin')
                ->active($app->isBundle('plugin'))
                ->setRole('ROLE_SYSTEM_SUPERUSER')
        );

        if ($app->isBundle('plugin') && $app->isAction('index')) {
            $app->add(
                $app->get('PluginMenu', 'save')
                    ->icon('icon-floppy-disk')
                    ->label('speichern')
            )->add(
                $app->get('PluginMenu', 'import')
                    ->icon('icon-upload')
                    ->label('importieren')
                    ->path('metador_admin_plugin_import')
            );
        }
    }
}
