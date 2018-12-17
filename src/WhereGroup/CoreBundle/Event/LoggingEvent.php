<?php

namespace WhereGroup\CoreBundle\Event;

use Plugins\WhereGroup\LoggingBundle\Entity\Log;
use Symfony\Component\EventDispatcher\Event;

/**
 * Class LoggingEvent
 * @package WhereGroup\CoreBundle\Event
 */
class LoggingEvent extends Event
{
    /** @var  Log $log */
    private $log;

    /**
     * LoggingEvent constructor.
     * @param $log
     */
    public function __construct($log)
    {
        $this->log = $log;
    }

    public function __destruct()
    {
        unset($this->log);
    }

    /**
     * @return Log
     */
    public function getLog()
    {
        return $this->log;
    }
}
