<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use WhereGroup\UserBundle\Entity\User;

/**
 * Class LoggingEvent
 * @package WhereGroup\CoreBundle\Event
 */
class LoggingEvent extends Event
{
    private $type;

    private $message;

    /** @var  User */
    private $user;

    /** @var  \DateTime */
    private $dateTime;

    /**
     * LoggingEvent constructor.
     */
    public function __construct()
    {
        $this->dateTime = new \DateTime();
    }

    public function __destruct()
    {
        unset(
            $this->type,
            $this->message,
            $this->user,
            $this->dateTime
        );
    }

    /**
     * @return mixed
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param $type
     * @return $this
     */
    public function setType($type)
    {
        $this->type = $type;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * @param $message
     * @return $this
     */
    public function setMessage($message)
    {
        $this->message = $message;
        return $this;
    }

    /**
     * @return User
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param $user
     * @return $this
     */
    public function setUser($user)
    {
        $this->user = $user;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDateTime()
    {
        return $this->dateTime;
    }
}
