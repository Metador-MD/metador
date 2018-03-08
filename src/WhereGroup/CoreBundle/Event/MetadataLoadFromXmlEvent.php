<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;

/**
 * Class MetadataLoadFromXmlEvent
 * @package WhereGroup\CoreBundle\Event
 */
class MetadataLoadFromXmlEvent extends Event
{
    protected $p;
    protected $profile;

    /**
     * MetadataLoadFromXMLEvent constructor.
     * @param array $p
     * @param $profile
     */
    public function __construct(array &$p, $profile)
    {
        $this->p = $p;
        $this->profile = $profile;
    }

    public function __destruct()
    {
        unset($this->p, $this->profile);
    }

    /**
     * @return mixed
     */
    public function getObject()
    {
        return $this->p;
    }

    /**
     * @return mixed
     */
    public function getProfile()
    {
        return $this->profile;
    }

    /**
     * @param $p
     * @return $this
     */
    public function setObject($p)
    {
        $this->p = $p;
        return $this;
    }
}
