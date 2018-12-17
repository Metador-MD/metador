<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use Symfony\Component\Translation\TranslatorInterface;
use WhereGroup\CoreBundle\Entity\HealthCheck;

/**
 * Class HealthCheckEvent
 * @package WhereGroup\CoreBundle\Event
 */
class HealthCheckEvent extends Event
{
    private $log        = null;
    private $translator = null;

    /**
     * HealthCheckEvent constructor.
     * @param HealthCheck $log
     * @param TranslatorInterface $translator
     */
    public function __construct(
        HealthCheck $log,
        TranslatorInterface $translator
    ) {
        $this->log        = $log;
        $this->translator = $translator;
    }

    /**
     * @param $origin
     * @param $message
     * @param array $parameters
     */
    public function addWarning($origin, $message, $parameters = [])
    {
        $this->log->addWarning(
            $origin,
            $this->translator->trans($message, $parameters)
        );
    }
}
