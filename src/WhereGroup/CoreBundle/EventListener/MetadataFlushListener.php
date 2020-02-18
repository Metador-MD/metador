<?php

namespace WhereGroup\CoreBundle\EventListener;

use WhereGroup\CoreBundle\Event\MetadataFlushEvent;
use WhereGroup\CoreBundle\Service\Database;

/**
 * Class MetadataFlushListener
 * @package WhereGroup\CoreBundle\EventListener
 */
class MetadataFlushListener
{
    private $db;

    /**
     * MetadataFlushListener constructor.
     * @param Database $db
     */
    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    /**
     * @param MetadataFlushEvent $event
     */
    public function onFlush(MetadataFlushEvent $event)
    {
        $this->db->flush();
    }
}
