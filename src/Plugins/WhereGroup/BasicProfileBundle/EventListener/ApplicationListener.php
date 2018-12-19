<?php

namespace Plugins\WhereGroup\BasicProfileBundle\EventListener;

use WhereGroup\CoreBundle\Component\Configuration;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package Plugins\WhereGroup\BasicProfileBundle\EventListener
 */
class ApplicationListener
{
    protected $configuration;

    /**
     * @param Configuration $configuration
     */
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

        if ($app->routeStartsWith('metador_admin')) {
            if (in_array('lists', $conf)) {
                $app->add(
                    $app->get('AdminMenu', 'lists')
                        ->icon('icon-file-text')
                        ->label('Auswahllisten')
                        ->path('metador_admin_lists')
                        ->setRole('ROLE_SYSTEM_GEO_OFFICE')
                        ->active($app->routeStartsWith('metador_admin_lists'))
                );
            }

            if (in_array('keywords', $conf)) {
                $app->add(
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
}
