<?php

namespace WhereGroup\CoreBundle\Component;

use DateTime;
use Exception;
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
    private $translator;

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

    /**
     *
     */
    public function __destruct()
    {
        unset(
            $this->flashbag,
            $this->eventDispatcher,
            $this->userService,
            $this->translator
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
     * @param bool $flush
     * @return $this
     */
    public function set(Log $log, $flush = true)
    {
        // Find user
        /** @var User $user */
        $user = $log->getUser();

        if (is_null($user) && is_null($log->getUsername())) {
            $log->setUsername($this->userService->getUsernameFromSession());
        } elseif (is_null($log->getUsername()) && $user instanceof User) {
            $log->setUsername($user->getUsername());
        }

        if (is_null($log->getDateTime())) {
            try {
                $dateTime = new DateTime();
            } catch (Exception $e) {
                $dateTime = null;
            }

            $log->setDateTime($dateTime);
        }

        // Translate message
        $log->setMessage($this->translator->trans($log->getMessage(), $log->getMessageParameter()));

        // Set flash message
        if ($log->isFlashMessage()) {
            $this->flashBag->add($log->getType(), $log->getMessage());
        }

        // Throw event
        $this->eventDispatcher->dispatch('metador.log', new LoggingEvent($log, $flush));

        return $this;
    }

    /**
     * @param $message
     * @param array $param
     */
    public function error($message, $param = [])
    {
        $this->log($message, $param, 'error');
    }

    protected function log($message, $param = [], $type = 'error')
    {
        $log = $this->newLog();
        $log
            ->setMessage($message, $param)
            ->setCategory('system')
            ->setType($type);
        $this->set($log);
    }
}
