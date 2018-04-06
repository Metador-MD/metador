<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;

/**
 * Class MetadataChangeEvent
 * @package WhereGroup\CoreBundle\Event
 */
class MetadataChangeEvent extends Event
{
    protected $dataset;
    protected $config;
    protected $errors;

    /**
     * MetadataChangeEvent constructor.
     * @param $dataset
     * @param $config
     */
    public function __construct($dataset, $config)
    {
        $this->dataset = $dataset;
        $this->config  = $config;
    }

    public function __destruct()
    {
        unset(
            $this->dataset,
            $this->config
        );
    }

    /**
     * @return mixed
     */
    public function getDataset()
    {
        return $this->dataset;
    }

    /**
     * @return mixed
     */
    public function getConfig()
    {
        return $this->config;
    }

    /**
     * @param $message
     * @param array $params
     * @return MetadataChangeEvent
     */
    public function addError($message, $params = [])
    {
        $this->errors[] = ['message' => $message, 'params' => $params];

        return $this;
    }

    /**
     * @return mixed
     */
    public function getErrors()
    {
        return $this->errors;
    }
}
