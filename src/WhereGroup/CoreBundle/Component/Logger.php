<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Translation\TranslatorInterface;
use WhereGroup\CoreBundle\Event\LoggingEvent;
use WhereGroup\UserBundle\Component\UserInterface;

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
            $this->tokenStorage,
            $this->translatorInterface
        );
    }

    /**
     * @param $message
     * @param array $parameters
     * @return Logger
     */
    public function flashInfo($message, $parameters = array())
    {
        return $this->log('info', $message, $parameters, true);
    }

    /**
     * @param $message
     * @param array $parameters
     * @return Logger
     */
    public function flashSuccess($message, $parameters = array())
    {
        return $this->log('success', $message, $parameters, true);
    }

    /**
     * @param $message
     * @param array $parameters
     * @return Logger
     */
    public function flashWarning($message, $parameters = array())
    {
        return $this->log('warning', $message, $parameters, true);
    }

    /**
     * @param $message
     * @param array $parameters
     * @return Logger
     */
    public function flashError($message, $parameters = array())
    {
        return $this->log('error', $message, $parameters, true);
    }

    /**
     * @param $message
     * @param array $parameters
     * @return Logger
     */
    public function info($message, $parameters = array())
    {
        return $this->log('info', $message, $parameters, false);
    }

    /**
     * @param $message
     * @param array $parameters
     * @return Logger
     */
    public function success($message, $parameters = array())
    {
        return $this->log('success', $message, $parameters, false);
    }

    /**
     * @param $message
     * @param array $parameters
     * @return Logger
     */
    public function warning($message, $parameters = array())
    {
        return $this->log('warning', $message, $parameters, false);
    }

    /**
     * @param $message
     * @param array $parameters
     * @return Logger
     */
    public function error($message, $parameters = array())
    {
        return $this->log('error', $message, $parameters, false);
    }

    /**
     * @param $type
     * @param $message
     * @param $parameters
     * @param $display
     * @return Logger
     */
    public function log($type, $category, $subcategory, $operation, $identifier, $message, $parameters, $display, $username = null)
    {
        $message = $this->translator->trans($message, $parameters);

        if (!empty($username)) {
            $user = $this->userService->getByUsername($username);
        } else {
            $user = $this->userService->getUserFromSession();
        }

        if ($display) {
            $this->flashBag->add($type, $message);
        }

        $event = new LoggingEvent();
        $event
            ->setType($type)
            ->setMessage($message)
            ->setUser($user);

        $this->eventDispatcher->dispatch('metador.log', $event);

        return $this;
    }
}
