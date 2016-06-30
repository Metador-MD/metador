<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use WhereGroup\CoreBundle\Event\HealthCheckEvent;
use WhereGroup\CoreBundle\Entity\HealthCheck as HealthCheckEntity;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * Class HealthCheck
 * @package WhereGroup\CoreBundle\Component
 */
class HealthCheck
{
    private $eventDispatcher;
    private $translatorInterface;

    /**
     * HealthCheck constructor.
     * @param EventDispatcherInterface $eventDispatcher
     * @param TranslatorInterface $translatorInterface
     */
    public function __construct(
        EventDispatcherInterface $eventDispatcher,
        TranslatorInterface $translatorInterface
    ) {
        $this->eventDispatcher = $eventDispatcher;
        $this->translatorInterface = $translatorInterface;
    }

    public function __destruct()
    {
        unset(
            $this->eventDispatcher,
            $this->translatorInterface
        );
    }

    /**
     * @return mixed
     */
    public function check()
    {
        $healthCheckEntity = new HealthCheckEntity();

        $this->eventDispatcher
            ->dispatch('application.health-check', new HealthCheckEvent(
                $healthCheckEntity,
                $this->translatorInterface
        ));

        return $healthCheckEntity->getResult();
    }
}
