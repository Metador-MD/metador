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
}
