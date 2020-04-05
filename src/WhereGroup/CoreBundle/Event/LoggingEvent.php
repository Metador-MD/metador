<?php

namespace WhereGroup\CoreBundle\Event;

use WhereGroup\CoreBundle\Entity\Log;
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
     * @var
     */
    private $flush;

    /**
     * LoggingEvent constructor.
     * @param $log
     * @param bool $flush
     */
    public function __construct($log, $flush = true)
    {
        $this->log = $log;
        $this->flush = $flush;
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

    /**
     * @return mixed
     */
    public function getFlush()
    {
        return $this->flush;
    }
}
