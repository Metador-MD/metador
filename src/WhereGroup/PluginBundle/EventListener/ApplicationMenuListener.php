<?php

namespace WhereGroup\PluginBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\PluginBundle\Component\ApplicationIntegration;

/**
 * Class ApplicationMenuListener
 * @package WhereGroup\PluginBundle\EventListener
 * @author A.R.Pour
 */
class ApplicationMenuListener extends ApplicationIntegration
{
    protected $app     = null;
    protected $prefix  = 'plugin';
    protected $tempFolder = null;
    protected $pluginFolder = null;

    /**
     * @param $exportPath
     */
    public function __construct($kernelRootDir)
    {
        $this->tempFolder = rtrim($kernelRootDir, '/') . '/../var/temp/';
        $this->pluginFolder = rtrim($kernelRootDir, '/') . '/../src/User/Plugin/';
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $this->app = $event->getApplication();

        /***********************************************************************
         * Admin Menu
         ***********************************************************************/
        $this->app->add('app-admin-menu', 'plugin', array(
            'icon'   => 'icon-stack',
            'label'  => 'Plugins',
            'path'   => 'metador_admin_plugin',
            'params' => array(),
            'active' => $this->app->isBundle('plugin')
        ), 'ROLE_SUPERUSER');

        if ($this->app->isBundle('plugin') && $this->app->isAction('index')) {
            $this->app->add('app-plugin-menu', 'save', array(
                'label'  => 'speichern',
                'icon'   => 'icon-floppy-disk'
            ));

            $this->app->add('app-plugin-menu', 'import', array(
                'label'  => 'importieren',
                'icon'   => 'icon-upload',
                'path'   => 'metador_admin_plugin_import',
                'params' => array(),
            ));
        }

        if ($this->app->isRoute('metador_admin_index')) {
            if (!is_dir($this->tempFolder) || !is_writeable($this->tempFolder)) {
                $this->addToWarnings('icon-notification', 'Order "/var/temp/" nicht beschreibbar!');
            }

            if (!is_dir($this->pluginFolder) || !is_writeable($this->pluginFolder)) {
                $this->addToWarnings('icon-notification', 'Order "/src/User/Plugin/" nicht beschreibbar!');
            }
        }
    }
}
