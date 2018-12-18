<?php

namespace WhereGroup\PluginBundle\EventListener;

use Plugins\WhereGroup\LoggingBundle\Entity\Log;
use WhereGroup\CoreBundle\Event\HealthCheckEvent;
use WhereGroup\CoreBundle\EventListener\BasicHealthcheckListener;

/**
 * Class HealthCheckListener
 * @package WhereGroup\PluginBundle\EventListener
 */
class HealthCheckListener extends BasicHealthcheckListener
{
    protected $projectDir = null;
    protected $tempDir    = null;
    protected $pluginDir  = null;

    /**
     * HealthCheckListener constructor.
     * @param $projectDir
     * @param $tempDir
     * @param $pluginDir
     */
    public function __construct($projectDir, $tempDir, $pluginDir)
    {
        $this->projectDir = $projectDir;
        $this->tempDir    = $tempDir;
        $this->pluginDir  = $pluginDir;
    }

    /**
     * @param HealthCheckEvent $healthCheck
     * @throws \Exception
     */
    public function onCheck(HealthCheckEvent $healthCheck)
    {
        $this->healthCheck = $healthCheck;

        $this
            ->add($this->testTempFolder(),
                'healthcheck_folder_not_writeable',
                ['%path%' => str_replace($this->projectDir, "", $this->tempDir)])
            ->add($this->testPluginFolder(),
                'healthcheck_folder_not_writeable',
                ['%path%' => str_replace($this->projectDir, "", $this->pluginDir)])
        ;
    }

    /**
     * @return string
     */
    private function testTempFolder() : string
    {
        return (!is_dir($this->tempDir) || !is_writeable($this->tempDir)) ? Log::ERROR : Log::SUCCESS;
    }

    /**
     * @return string
     */
    private function testPluginFolder() : string
    {
        return (!is_dir($this->pluginDir) || !is_writeable($this->pluginDir)) ? Log::WARNING : Log::SUCCESS;
    }
}
