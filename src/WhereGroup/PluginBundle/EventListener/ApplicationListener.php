<?php

namespace WhereGroup\PluginBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

class ApplicationListener
{
    protected $tempFolder = null;
    protected $pluginFolder = null;

    /**
     * @param $kernelRootDir
     */
    public function __construct($kernelRootDir)
    {
        $this->tempFolder = rtrim($kernelRootDir, '/') . '/../var/temp/';
        $this->pluginFolder = rtrim($kernelRootDir, '/') . '/../src/Plugins/';
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $app->newAdd(
            $app->getClass('AdminMenu', 'plugin')
                ->icon('icon-power-cord')
                ->label('Plugins')
                ->path('metador_admin_plugin')
                ->active($app->isBundle('plugin'))
                ->setRole('ROLE_SUPERUSER')
        );

        if ($app->isBundle('plugin') && $app->isAction('index')) {
            $app->newAdd(
                $app->getClass('PluginMenu', 'save')
                    ->icon('icon-floppy-disk')
                    ->label('speichern')
            )->newAdd(
                $app->getClass('PluginMenu', 'import')
                    ->icon('icon-upload')
                    ->label('importieren')
                    ->path('metador_admin_plugin_import')
            );
        }

        if ($app->isRoute('metador_admin_index')) {
            if (!is_dir($this->tempFolder) || !is_writeable($this->tempFolder)) {
                $app->newAdd(
                    $app->getClass('AppInformation')
                        ->warning('Order "/var/temp/" nicht beschreibbar!')
                );
            }

            if (!is_dir($this->pluginFolder) || !is_writeable($this->pluginFolder)) {
                $app->newAdd(
                    $app->getClass('AppInformation')
                        ->warning('Order "' . basename($this->pluginFolder) . '" nicht beschreibbar!')
                );
            }
        }
    }
}
