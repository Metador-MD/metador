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
    private $slug;

    /**
     * TaskManagerEvent constructor.
     * @param $slug
     */
    public function __construct($slug)
    {
        $this->messages = [];
        $this->setSlug($slug);
    }

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param mixed $slug
     * @return SourceEvent
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;
        return $this;
    }

    /**
     * @param $message
     * @param $parameter
     * @return SourceEvent
     */
    public function addMessage($message, $parameter = [])
    {
        $this->messages[]  = [
            'message'   => $message,
            'parameter' => $parameter
        ];
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
