<?php

namespace WhereGroup\CoreBundle\EventListener;

use mysql_xdevapi\Exception;
use WhereGroup\CoreBundle\Entity\HealthCheck;
use WhereGroup\CoreBundle\Event\HealthCheckEvent;

/**
 * Class BasicHealthcheckListener
 * @package WhereGroup\CoreBundle\EventListener
 */
abstract class BasicHealthcheckListener
{
    protected $origin = 'Core';

    /** @var HealthCheckEvent|null $healthCheck  */
    protected $healthCheck = null;

    /**
     * @param $result
     * @param $message
     * @param array $parameter
     * @return $this
     * @throws \Exception
     */
    protected function add($result, $message, $parameter = [])
    {
        if (is_null($this->healthCheck)) {
            throw new \Exception('HealthCheckEvent not set in listener.');
        }

        $check = new HealthCheck();
        $check
            ->setOrigin($this->origin)
            ->setMessage($message)
            ->setParameters($parameter);

        $this->healthCheck->add($check->setResult($result));
        return $this;
    }
}
