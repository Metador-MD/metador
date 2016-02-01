<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Translation\TranslatorInterface;
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
    private $translatorInterface;

    /**
     * Logger constructor.
     * @param FlashBagInterface $flashBag
     * @param EventDispatcherInterface $eventDispatcher
     * @param TokenStorageInterface $tokenStorage
     * @param TranslatorInterface $translatorInterface
     */
    public function __construct(
        FlashBagInterface $flashBag,
        EventDispatcherInterface $eventDispatcher,
        TokenStorageInterface $tokenStorage,
        TranslatorInterface $translatorInterface
    ) {
        $this->flashBag = $flashBag;
        $this->eventDispatcher = $eventDispatcher;
        $this->tokenStorage = $tokenStorage;
        $this->translatorInterface = $translatorInterface;
    }

    public function __destruct()
    {
        unset(
            $this->flashbag,
            $this->eventDispatcher,
            $this->tokenStorage,
            $this->translatorInterface
        );
    }

    /**
     * @param $message
     * @param array $parameters
     * @param bool $display
     */
    public function info($message, $parameters = array(), $display = true)
    {
        $this->log('info', $message, $parameters, $display);
    }

    /**
     * @param $message
     * @param array $parameters
     * @param bool $display
     */
    public function success($message, $parameters = array(), $display = true)
    {
        $this->log('success', $message, $parameters, $display);
    }

    /**
     * @param $message
     * @param array $parameters
     * @param bool $display
     */
    public function warning($message, $parameters = array(), $display = true)
    {
        $this->log('warning', $message, $parameters, $display);
    }

    /**
     * @param $message
     * @param array $parameters
     * @param bool $display
     */
    public function error($message, $parameters = array(), $display = true)
    {
        $this->log('error', $message, $parameters, $display);
    }

    /**
     * @param $type
     * @param $message
     * @param $parameters
     * @param $display
     */
    public function log($type, $message, $parameters, $display)
    {
        $message = $this->translatorInterface->trans($message, $parameters);

        if ($display) {
            $this->flashBag->add($type, $message);
        }

        $this->eventDispatcher->dispatch(
            'metador.log',
            new LoggingEvent(
                $type,
                $message,
                $this->tokenStorage->getToken()->getUser(),
                new \DateTime()
            )
        );
    }
}
