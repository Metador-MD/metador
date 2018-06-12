<?php

namespace WhereGroup\AddressBundle\Event;

use Symfony\Component\EventDispatcher\Event;

/**
 * Class AddressChangeEvent
 * @package WhereGroup\AddressBundle\Event
 */
class AddressChangeEvent extends Event
{
    protected $entity;
    protected $config;

    /**
     * AddressChangeEvent constructor.
     * @param $entity
     * @param $config
     */
    public function __construct($entity, $config)
    {
        $this->entity = $entity;
        $this->config = $config;
    }

    public function __destruct()
    {
        unset(
            $this->entity,
            $this->config
        );
    }

    /**
     * @return mixed
     */
    public function getAddress()
    {
        return $this->entity;
    }

    /**
     * @return mixed
     */
    public function getConfig()
    {
        return $this->config;
    }
}
