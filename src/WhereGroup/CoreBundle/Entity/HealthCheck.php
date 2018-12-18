<?php

namespace WhereGroup\CoreBundle\Entity;

/**
 * Class HealthCheck
 * @package WhereGroup\CoreBundle\Entity
 */
class HealthCheck
{
    private $origin = 'system';
    private $message = '';
    private $parameters = [];
    private $result = Log::INFO;

    /**
     * @return string
     */
    public function getOrigin(): string
    {
        return $this->origin;
    }

    /**
     * @return string
     */
    public function getMessage(): string
    {
        return $this->message;
    }

    /**
     * @return array
     */
    public function getParameters() : array
    {
        return $this->parameters;
    }

    /**
     * @param string $origin
     * @return HealthCheck
     */
    public function setOrigin(string $origin): HealthCheck
    {
        $this->origin = $origin;
        return $this;
    }

    /**
     * @param string $message
     * @return HealthCheck
     */
    public function setMessage(string $message): HealthCheck
    {
        $this->message = $message;
        return $this;
    }

    /**
     * @param array $parameters
     * @return HealthCheck
     */
    public function setParameters(array $parameters): HealthCheck
    {
        $this->parameters = $parameters;
        return $this;
    }

    /**
     * @return string
     */
    public function getResult(): string
    {
        return $this->result;
    }

    /**
     * @param string $result
     * @return HealthCheck
     */
    public function setResult(string $result) : HealthCheck
    {
        $this->result = $result;
        return $this;
    }
}
