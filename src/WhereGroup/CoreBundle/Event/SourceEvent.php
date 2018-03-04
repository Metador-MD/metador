<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use WhereGroup\CoreBundle\Entity\Source;
use WhereGroup\UserBundle\Component\UserInterface;

/**
 * Class SourceEvent
 * @package WhereGroup\CoreBundle\Event
 */
class SourceEvent extends Event
{
    /** @var  UserInterface $user */
    private $messages;

    /** @var Source */
    private $entity;

    /**
     * TaskManagerEvent constructor.
     * @param Source $entity
     */
    public function __construct($entity = null)
    {
        $this->messages = array();
        $this->entity   = $entity;
    }

    /**
     * @return Source
     */
    public function getEntity()
    {
        return $this->entity;
    }

    /**
     * @param Source $entity
     * @return SourceEvent
     */
    public function setEntity($entity)
    {
        $this->entity = $entity;
        return $this;
    }

    /**
     * @param $message
     * @return SourceEvent
     */
    public function addMessage($message)
    {
        $this->messages[] = $message;
        return $this;
    }

    /**
     * @return array
     */
    public function getMessages()
    {
        return $this->messages;
    }
}
