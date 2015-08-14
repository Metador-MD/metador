<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use WhereGroup\CoreBundle\Event\LoggingEvent;

/**
 * Class Logging
 * @package WhereGroup\CoreBundle\Component
 */
class Logger
{
    private $flashBag;
    private $eventDispatcher;
    private $tokenStorage;

    /**
     * @param FlashBagInterface $flashBag
     * @param EventDispatcherInterface $eventDispatcher
     * @param TokenInterface $tokenInterface
     */
    public function __construct(
        FlashBagInterface $flashBag,
        EventDispatcherInterface $eventDispatcher,
        TokenStorageInterface $tokenStorage
    ) {
        $this->flashBag = $flashBag;
        $this->eventDispatcher = $eventDispatcher;
        $this->tokenStorage = $tokenStorage;
    }

    public function __destruct()
    {
        unset(
            $this->flashbag,
            $this->eventDispatcher,
            $this->tokenStorage
        );
    }

    /**
     * @param $message
     * @param bool|true $display
     */
    public function info($message, $display = true)
    {
        $this->log('info', $message, $display);
    }

    /**
     * @param $message
     * @param bool|true $display
     */
    public function success($message, $display = true)
    {
        $this->log('success', $message, $display);
    }

    /**
     * @param $message
     * @param bool|true $display
     */
    public function warning($message, $display = true)
    {
        $this->log('warning', $message, $display);
    }

    /**
     * @param $message
     * @param bool|true $display
     */
    public function error($message, $display = true)
    {
        $this->log('error', $message, $display);
    }

    /**
     * @param $type
     * @param $message
     * @param $display
     */
    public function log($type, $message, $display)
    {
        if ($display) {
            $this->flashBag->add($type, $message);
        }

        $this->eventDispatcher->dispatch(
            'metador.on_log',
            new LoggingEvent(
                $type,
                $message,
                $this->tokenStorage->getToken()->getUser(),
                new \DateTime()
            )
        );
    }
}
