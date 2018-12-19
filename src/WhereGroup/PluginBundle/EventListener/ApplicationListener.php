<?php

namespace WhereGroup\PluginBundle\EventListener;

use WhereGroup\CoreBundle\Component\Configuration;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package WhereGroup\PluginBundle\EventListener
 */
class ApplicationListener
{
    private $configuration;

    public function __construct(Configuration $configuration)
    {
        $this->configuration = $configuration;
    }

    /**
     * @param ApplicationEvent $event
     * @throws \Exception
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();
        $conf = $this->configuration->get('administration', 'plugin', 'metador_core', []);

        if (!is_array($conf)) {
            $conf = [];
        }

        if ($app->routeStartsWith('metador_admin') && in_array('plugin', $conf)) {
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
}
