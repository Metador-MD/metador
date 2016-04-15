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

        $app->add(
            $app->get('AdminMenu', 'plugin')
                ->icon('icon-power-cord')
                ->label('Plugins')
                ->path('metador_admin_plugin')
                ->active($app->isBundle('plugin'))
                ->setRole('ROLE_SUPERUSER')
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

        if ($app->isRoute('metador_admin_index')) {
            if (!is_dir($this->tempFolder) || !is_writeable($this->tempFolder)) {
                $app->add(
                    $app->get('AppInformation')
                        ->warning('Order "/var/temp/" nicht beschreibbar!')
                );
            }

            if (!is_dir($this->pluginFolder) || !is_writeable($this->pluginFolder)) {
                $app->add(
                    $app->get('AppInformation')
                        ->warning('Order "' . basename($this->pluginFolder) . '" nicht beschreibbar!')
                );
            }
        }
    }
}