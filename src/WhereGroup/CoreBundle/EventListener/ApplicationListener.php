<?php

namespace WhereGroup\CoreBundle\EventListener;

use WhereGroup\CoreBundle\Component\Cache;
use WhereGroup\CoreBundle\Component\MetadataInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package WhereGroup\CoreBundle\EventListener
 */
class ApplicationListener
{
    private $metadata;
    private $cache;

    /**
     * ApplicationListener constructor.
     * @param MetadataInterface $metadata
     * @param Cache $cache
     */
    public function __construct(MetadataInterface $metadata, Cache $cache)
    {
        $this->metadata = $metadata;
        $this->cache = $cache;
    }

    public function __destruct()
    {
        unset($this->metadata);
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        // ADMIN AREA
        if ($app->routeStartsWith('metador_admin')) {
            $app->add(
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
                $app->get('AdminMenu', 'source')
                    ->icon('icon-database')
                    ->label('Datenquellen')
                    ->path('metador_admin_source')
                    ->active($app->routeStartsWith('metador_admin_source'))
                    ->setRole('ROLE_SYSTEM_SUPERUSER')
            );

            if ($app->isRoute('metador_admin_index')) {
                $stats = $this->cache->stats();
                $usage = '-';

                if (is_array($stats) && isset($stats[key($stats)]['limit_maxbytes']) && $stats[key($stats)]['bytes']) {
                    $usage = round($stats[key($stats)]['bytes'] * 100 / $stats[key($stats)]['limit_maxbytes']) . '%';
                }

                $app->add(
                    $app->get('AppInformation', 'metadata-info')
                        ->icon('icon-database')
                        ->label('Metadaten')
                        ->count($this->metadata->count())
                        ->setRole('ROLE_SYSTEM_GEO_OFFICE')
                )->add(
                    $app->get('AppInformation', 'cache-info')
                        ->icon('icon-database')
                        ->label('Cache')
                        ->count($usage)
                        ->setRole('ROLE_SYSTEM_SUPERUSER')
                );
            }
        }

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
        );
    }
}
