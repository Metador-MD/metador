<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use WhereGroup\UserBundle\Component\UserInterface;

class TaskManagerEvent extends Event
{
    /** @var  UserInterface $user */
    private $user;
    private $messages;

    /**
     * TaskManagerEvent constructor.
     * @param $user
     */
    public function __construct($user)
    {
        $this->user = $user;
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

    /**
     * @return mixed
     */
    public function getUser()
    {
        return $this->user;
    }
}
