<?php

namespace Plugins\WhereGroup\ManualBundle\EventListener;

use Exception;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\PluginBundle\Component\ApplicationIntegration\ManualMenu;

/**
 * Class ApplicationListener
 * @package Plugins\WhereGroup\ManualBundle\EventListener
 */
class ApplicationListener
{
    protected $app;

    /**
     * @param ApplicationEvent $event
     * @throws Exception
     */
    public function onApplicationLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $app->add(
            $app->get('GlobalMenu', 'book')
                ->icon('icon-book')
                ->label('')
                ->title('Handbuch')
                ->path('manual_index')
                ->active($app->routeStartsWith('manual'))
        );

        if ($app->routeStartsWith('manual')) {
            $app->append(
                $app->getIntegrationClass(ManualMenu::class, 'user_manual')
                    ->icon('icon-book')
                    ->label('Anwenderhandbuch')
                    ->path('manual_index')
                    ->active(false)
            )->append(
                $app->getIntegrationClass(ManualMenu::class, 'admin_manual')
                    ->icon('icon-wrench')
                    ->label('Administration')
                    ->path('manual_index', ['manual' => 'Administration'])
                    ->setRole('ROLE_SYSTEM_SUPERUSER')
                    ->active(false)
            );

            if ($app->isEnv('dev')) {
                $app->append(
                    $app->getIntegrationClass(ManualMenu::class, 'dev_manual')
                        ->icon('icon-puzzle-piece')
                        ->label('Entwicklung')
                        ->path('manual_index', ['manual' => 'Entwicklung'])
                        ->active(false)
                );
            }
        }
    }
}
