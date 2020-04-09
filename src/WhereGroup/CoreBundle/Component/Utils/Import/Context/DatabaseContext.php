<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Context;

/**
 * Class DatabaseContext
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Context
 */
class DatabaseContext implements Context
{
    private $service;
    private $source;
    private $entityName;
    private $filter = [];

    /**
     * @return mixed
     */
    public function getService()
    {
        return $this->service;
    }

    public function setService($service)
    {
        $this->service = $service;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * @param mixed $source
     * @return DatabaseContext
     */
    public function setSource($source)
    {
        $this->source = $source;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getFilter()
    {
        return $this->filter;
    }

    /**
     * @param mixed $filter
     * @return DatabaseContext
     */
    public function setFilter($filter)
    {
        $this->filter = $filter;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getEntityName()
    {
        return $this->entityName;
    }

    /**
     * @param mixed $entityName
     * @return DatabaseContext
     */
    public function setEntityName($entityName)
    {
        $this->entityName = $entityName;

        return $this;
    }
}
