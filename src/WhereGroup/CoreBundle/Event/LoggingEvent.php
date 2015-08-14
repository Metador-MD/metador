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
     * @param $type
     * @param $message
     * @param $user
     * @param $dateTime
     */
    public function __construct($type, $message, $user, $dateTime)
    {
        $this->type     = $type;
        $this->message  = $message;
        $this->user     = $user;
        $this->dateTime = $dateTime;
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
     * @return mixed
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * @return User
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @return mixed
     */
    public function getDateTime()
    {
        return $this->dateTime;
    }
}
