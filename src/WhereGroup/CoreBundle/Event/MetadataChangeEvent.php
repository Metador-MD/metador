<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;

class MetadataChangeEvent extends Event
{
    protected $dataset;
    protected $config;

    public function __construct($dataset, $config)
    {
        $this->dataset = $dataset;
        $this->config = $config;
    }

    public function getDataset()
    {
        return $this->dataset;
    }

    public function getConfig()
    {
        return $this->config;
    }
}
