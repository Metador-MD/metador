<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;

class TaskManagerEvent extends Event
{
    private $user;
    private $messages;

    public function __construct($user)
    {
        $this->user = $user;
        $this->messages = array();
    }

    public function addMessage($message)
    {
        $this->messages[] = $message;
    }

    public function getMessages()
    {
        return $this->messages;
    }

    public function getUser()
    {
        return $this->user;
    }
}
