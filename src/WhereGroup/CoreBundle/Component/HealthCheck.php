<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use WhereGroup\CoreBundle\Event\HealthCheckEvent;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * Class HealthCheck
 * @package WhereGroup\CoreBundle\Component
 */
class HealthCheck
{
    /** @var EventDispatcherInterface */
    private $eventDispatcher;

    /** @var TranslatorInterface */
    private $translatorInterface;

    /**
     * HealthCheck constructor.
     * @param EventDispatcherInterface $eventDispatcher
     * @param TranslatorInterface $translatorInterface
     */
    public function __construct(EventDispatcherInterface $eventDispatcher, TranslatorInterface $translatorInterface)
    {
        $this->eventDispatcher = $eventDispatcher;
        $this->translatorInterface = $translatorInterface;
    }

    /**
     *
     */
    public function __destruct()
    {
        unset($this->eventDispatcher, $this->translatorInterface);
    }

    /**
     * @return HealthCheckEvent
     */
    public function check() : HealthCheckEvent
    {
        $event = new HealthCheckEvent($this->translatorInterface);

        $this->eventDispatcher->dispatch('application.health-check', $event);

        return $event;
    }
}
