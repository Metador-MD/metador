<?php

namespace WhereGroup\CoreBundle\EventListener;

use WhereGroup\CoreBundle\Component\ConfigurationInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package WhereGroup\CoreBundle\EventListener
 */
class ApplicationListener
{
    private $configuration;

    /**
     * ApplicationListener constructor.
     * @param ConfigurationInterface $configuration
     */
    public function __construct(ConfigurationInterface $configuration)
    {
        $this->configuration = $configuration;
    }

    public function __destruct()
    {
        unset($this->configuration);
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $app->add(
            $app->get('GlobalMenu', 'admin')
                ->icon('icon-cog')
                ->label('Administration')
                ->path('metador_admin_index')
                ->active($app->routeStartsWith('metador_admin'))
                ->setRole('ROLE_SYSTEM_GEO_OFFICE')
        )->add(
            $app->get('GlobalMenu', 'home')
                ->icon('icon-home')
                ->label('Startseite')
                ->path('metador_home')
        )->add(
            $app->get('AdminMenu', 'index')
                ->icon('icon-eye')
                ->label('Übersicht')
                ->path('metador_admin_index')
                ->setRole('ROLE_SYSTEM_GEO_OFFICE')
        )->add(
            $app->get('AdminMenu', 'settings')
                ->icon('icon-wrench')
                ->label('Einstellungen')
                ->path('metador_admin_settings')
                ->setRole('ROLE_SYSTEM_SUPERUSER')
        )->add(
            $app->get('Configuration', 'session')
                ->parameter('session_dialog', $this->configuration->getValue(
                    'session-timeout-popup',
                    'plugin',
                    'metador-core'
                ))
        );
    }
}
