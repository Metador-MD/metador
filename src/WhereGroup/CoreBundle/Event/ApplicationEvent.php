<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use WhereGroup\CoreBundle\Component\Application;

/**
 * Class ApplicationEvent
 * @package WhereGroup\CoreBundle\Event
 */
class ApplicationEvent extends Event
{
    protected $application;
    protected $config;

    /**
     * @param Application $application
     * @param $config
     */
    public function __construct(Application $application, $config)
    {
        $this->application = $application;
        $this->config      = $config;
    }

    public function __destruct()
    {
        unset(
            $this->application,
            $this->config
        );
    }

    /**
     * @return Application
     */
    public function getApplication()
    {
        return $this->application;
    }

    /**
     * @return mixed
     */
    public function getConfig()
    {
        return $this->config;
    }
}
