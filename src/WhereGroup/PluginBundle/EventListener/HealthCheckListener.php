<?php

namespace WhereGroup\PluginBundle\EventListener;

use WhereGroup\CoreBundle\Event\HealthCheckEvent;

/**
 * Class HealthCheckListener
 * @package WhereGroup\PluginBundle\EventListener
 */
class HealthCheckListener
{
    protected $rootDir   = null;
    protected $tempDir   = null;
    protected $pluginDir = null;

    /**
     * HealthCheckListener constructor.
     * @param $rootDir
     * @param $tempDir
     * @param $pluginDir
     */
    public function __construct($rootDir, $tempDir, $pluginDir)
    {
        $this->rootDir   = $rootDir;
        $this->tempDir   = $tempDir;
        $this->pluginDir = $pluginDir;
    }

    /**
     * @param HealthCheckEvent $healthCheck
     */
    public function onCheck(HealthCheckEvent $healthCheck)
    {
        if (!is_dir($this->tempDir) || !is_writeable($this->tempDir)) {
            $healthCheck->addWarning(
                'PluginBundle',
                'healthcheck_folder_not_writeable',
                array('%path%' => str_replace($this->rootDir, "", $this->tempDir))
            );
        }

        if (!is_dir($this->pluginDir) || !is_writeable($this->pluginDir)) {
            $healthCheck->addWarning(
                'PluginBundle',
                'healthcheck_folder_not_writeable',
                array('%path%' => str_replace($this->rootDir, "", $this->pluginDir))
            );
        }
    }
}
