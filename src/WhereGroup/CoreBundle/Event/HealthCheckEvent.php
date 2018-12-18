<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use Symfony\Component\Translation\TranslatorInterface;
use WhereGroup\CoreBundle\Entity\HealthCheck;
use WhereGroup\CoreBundle\Entity\Log;

/**
 * Class HealthCheckEvent
 * @package WhereGroup\CoreBundle\Event
 */
class HealthCheckEvent extends Event
{
    private $data = [];
    private $translator = null;
    private $hasError = false;
    private $errorCount = 0;

    /**
     * HealthCheckEvent constructor.
     * @param TranslatorInterface $translator
     */
    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    /**
     * @param HealthCheck $check
     * @return $this
     */
    public function add(HealthCheck $check) : HealthCheckEvent
    {
        // Translate
        $check->setMessage($this->translator->trans($check->getMessage(), $check->getParameters()));

        if ($check->getResult() !== Log::SUCCESS && $check->getResult() !== Log::INFO) {
            $this->hasError = true;
            ++$this->errorCount;
        }

        $this->data[] = $check;
        return $this;
    }

    /**
     * @return bool
     */
    public function hasError(): bool
    {
        return (bool)$this->hasError;
    }

    /**
     * @return int
     */
    public function getErrorCount() : int
    {
        return (int)$this->errorCount;
    }

    /**
     * @return HealthCheck[]
     */
    public function getLogs() : array
    {
        return $this->data;
    }
}
