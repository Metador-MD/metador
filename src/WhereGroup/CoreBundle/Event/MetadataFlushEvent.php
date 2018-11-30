<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;

/**
 * Class MetadataFlushEvent
 * @package WhereGroup\CoreBundle\Event
 */
class MetadataFlushEvent extends Event
{
    /** @var  array $conf */
    private $conf;

    /**
     * LoggingEvent constructor.
     * @param $conf
     */
    public function __construct($conf = [])
    {
        $this->conf = $conf;
    }

    public function __destruct()
    {
        unset($this->conf);
    }

    /**
     * @return array
     */
    public function getConf()
    {
        return $this->conf;
    }
}
