<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\Translation\TranslatorInterface;
use WhereGroup\CoreBundle\Entity\Log;
use WhereGroup\CoreBundle\Event\LoggingEvent;
use WhereGroup\UserBundle\Component\UserInterface;
use WhereGroup\UserBundle\Entity\User;

/**
 * Class Logging
 * @package WhereGroup\CoreBundle\Component
 */
class Logger
{
    private $flashBag;
    private $eventDispatcher;
    private $userService;
    private $translatorInterface;

    /**
     * Logger constructor.
     * @param FlashBagInterface $flashBag
     * @param EventDispatcherInterface $eventDispatcher
     * @param TranslatorInterface $translator
     * @param UserInterface $userService
     */
    public function __construct(
        FlashBagInterface $flashBag,
        EventDispatcherInterface $eventDispatcher,
        TranslatorInterface $translator,
        UserInterface $userService
    ) {
        $this->flashBag            = $flashBag;
        $this->eventDispatcher     = $eventDispatcher;
        $this->translator          = $translator;
        $this->userService         = $userService;
    }

    public function __destruct()
    {
        unset(
            $this->flashbag,
            $this->eventDispatcher,
            $this->userService,
            $this->translatorInterface
        );
    }

    /**
     * @return Log
     */
    public function newLog()
    {
        return new Log();
    }

    /**
     * @param Log $log
     * @return $this
     */
    public function set(Log $log)
    {
        // Find user
        /** @var User $user */
        $user = $log->getUser();

        if (is_null($user) && is_null($log->getUsername())) {
            $log->setUsername($this->userService->getUsernameFromSession());
        } elseif (is_null($log->getUsername()) && $user instanceof User) {
            $log->setUsername($user->getUsername());
        }

        // Translate message
        $log->setMessage($this->translator->trans($log->getMessage(), $log->getMessageParameter()));

        // Set flash message
        if ($log->isFlashMessage()) {
            $this->flashBag->add($log->getType(), $log->getMessage());
        }

        // Throw event
        $this->eventDispatcher->dispatch('metador.log', new LoggingEvent($log));

        return $this;
    }
}
