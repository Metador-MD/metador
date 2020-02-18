<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Context;

/**
 * Class ServiceContext
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Context
 */
class ServiceContext implements Context
{
    private $service;
    private $config;

    /**
     * @return mixed
     */
    public function getService()
    {
        return $this->service;
    }

    /**
     * @param mixed $service
     * @return ServiceContext
     */
    public function setService($service)
    {
        $this->service = $service;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getConfig()
    {
        return $this->config;
    }

    /**
     * @param mixed $config
     * @return ServiceContext
     */
    public function setConfig($config)
    {
        $this->config = $config;

        return $this;
    }
}
