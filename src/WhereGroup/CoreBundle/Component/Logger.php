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
     * @param $category
     * @param $subcategory
     * @param $operation
     * @param $source
     * @param $identifier
     * @param $message
     * @param array $parameters
     * @param null $username
     * @return Logger
     */
    public function flashInfo($category, $subcategory, $operation, $source, $identifier, $message, $parameters = array(), $username = null)
    {
        return $this->log('info', $category, $subcategory, $operation, $source, $identifier, $message, $parameters, true, $username);
    }

    /**
     * @param $category
     * @param $subcategory
     * @param $operation
     * @param $source
     * @param $identifier
     * @param $message
     * @param array $parameters
     * @param null $username
     * @return Logger
     */
    public function flashSuccess($category, $subcategory, $operation, $source, $identifier, $message, $parameters = array(), $username = null)
    {
        return $this->log('success', $category, $subcategory, $operation, $source, $identifier, $message, $parameters, true, $username);
    }

    /**
     * @param $category
     * @param $subcategory
     * @param $operation
     * @param $source
     * @param $identifier
     * @param $message
     * @param array $parameters
     * @param null $username
     * @return Logger
     */
    public function flashWarning($category, $subcategory, $operation, $source, $identifier, $message, $parameters = array(), $username = null)
    {
        return $this->log('warning', $category, $subcategory, $operation, $source, $identifier, $message, $parameters, true, $username);
    }

    /**
     * @param $category
     * @param $subcategory
     * @param $operation
     * @param $source
     * @param $identifier
     * @param $message
     * @param array $parameters
     * @param null $username
     * @return Logger
     */
    public function flashError($category, $subcategory, $operation, $source, $identifier, $message, $parameters = array(), $username = null)
    {
        return $this->log('error', $category, $subcategory, $operation, $source, $identifier, $message, $parameters, true, $username);
    }

    /**
     * @param $category
     * @param $subcategory
     * @param $operation
     * @param $source
     * @param $identifier
     * @param $message
     * @param array $parameters
     * @param null $username
     * @return Logger
     */
    public function info($category, $subcategory, $operation, $source, $identifier, $message, $parameters = array(), $username = null)
    {
        return $this->log('info', $category, $subcategory, $operation, $source, $identifier, $message, $parameters, false, $username);
    }

    /**
     * @param $category
     * @param $subcategory
     * @param $operation
     * @param $source
     * @param $identifier
     * @param $message
     * @param array $parameters
     * @param null $username
     * @return Logger
     */
    public function success($category, $subcategory, $operation, $source, $identifier, $message, $parameters = array(), $username = null)
    {
        return $this->log('success', $category, $subcategory, $operation, $source, $identifier, $message, $parameters, false, $username);
    }

    /**
     * @param $category
     * @param $subcategory
     * @param $operation
     * @param $source
     * @param $identifier
     * @param $message
     * @param array $parameters
     * @param null $username
     * @return Logger
     */
    public function warning($category, $subcategory, $operation, $source, $identifier, $message, $parameters = array(), $username = null)
    {
        return $this->log('warning', $category, $subcategory, $operation, $source, $identifier, $message, $parameters, false, $username);
    }

    /**
     * @param $category
     * @param $subcategory
     * @param $operation
     * @param $source
     * @param $identifier
     * @param $message
     * @param array $parameters
     * @param null $username
     * @return Logger
     */
    public function error($category, $subcategory, $operation, $source, $identifier, $message, $parameters = array(), $username = null)
    {
        return $this->log('error', $category, $subcategory, $operation, $source, $identifier, $message, $parameters, flase, $username);
    }

    /**
     *
     * @param $type
     * @param $category
     * @param $subcategory
     * @param $operation
     * @param $source
     * @param $identifier
     * @param $message
     * @param array $parameters
     * @param $display
     * @param $username
     * @return Logger
     */
    public function log($type, $category, $subcategory, $operation, $source, $identifier, $message, $parameters, $display, $username)
    {
        $translatedMessage = $this->translator->trans($message, $parameters);

        if ($username instanceof UserInterface) {
            $user = $username;
            unset($username);
        } elseif (!empty($username)) {
            $user = $this->userService->getByUsername($username);
        } else {
            $user = $this->userService->getUserFromSession();
        }

        if ($display) {
            $this->flashBag->add($type, $translatedMessage);
        }

        $event = new LoggingEvent();
        $event
            ->setType($type)
            ->setCategory($category)
            ->setSubcategory($subcategory)
            ->setOperation($operation)
            ->setSource($source)
            ->setIdentifier($identifier)
            ->setMessage($translatedMessage)
            ->setUser($user);

        $this->eventDispatcher->dispatch('metador.log', $event);

        return $this;
    }
}
