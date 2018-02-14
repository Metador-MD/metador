<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use WhereGroup\UserBundle\Component\UserInterface;

/**
 * Class TaskManagerEvent
 * @package WhereGroup\CoreBundle\Event
 */
class TaskManagerEvent extends Event
{
    /** @var  UserInterface $user */
    private $messages;

    /**
     * TaskManagerEvent constructor.
     */
    public function __construct()
    {
        $this->messages = array();
    }

    /**
     * @param $message
     */
    public function addMessage($message)
    {
        $this->messages[] = $message;
    }

    /**
     * @return array
     */
    public function getMessages()
    {
        return $this->messages;
    }
}
