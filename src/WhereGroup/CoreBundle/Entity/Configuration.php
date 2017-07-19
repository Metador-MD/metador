<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * WhereGroup\CoreBundle\Entity\Configuration
 *
 * @ORM\Table(name="configuration")
 * @ORM\Entity
 * @ORM\Entity(repositoryClass="WhereGroup\CoreBundle\Entity\ConfigurationRepository")
 */
class Configuration
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string", length=255, nullable=false)
     */
    private $filterType;

    /**
     * @ORM\Id
     * @ORM\Column(type="string", length=255, nullable=false)
     */
    private $filterValue;

    /**
     * @ORM\Id
     * @ORM\Column(type="string", length=255, nullable=false)
     */
    private $key;

    /**
     * @ORM\Column(type="text", nullable=false, nullable=true)
     */
    private $value;

    /**
     * @ORM\Column(type="boolean", options={"default" : false})
     */
    private $json;

    /**
     * @return mixed
     */
    public function getFilterType()
    {
        return $this->filterType;
    }

    /**
     * @param $filterType
     * @return $this
     */
    public function setFilterType($filterType)
    {
        $this->filterType = $filterType;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getFilterValue()
    {
        return $this->filterValue;
    }

    /**
     * @param $filterValue
     * @return $this
     */
    public function setFilterValue($filterValue)
    {
        $this->filterValue = $filterValue;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * @param $key
     * @return $this
     */
    public function setKey($key)
    {
        $this->key = $key;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getValue()
    {
        return $this->getJson() ? json_decode($this->value, true) : $this->value;
    }

    /**
     * @param $value
     * @return $this
     */
    public function setValue($value)
    {
        $this->setJson(false);

        if (!is_string($value) && !is_numeric($value)) {
            $value = json_encode($value);
            $this->setJson(true);
        }

        $this->value = $value;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getJson()
    {
        return $this->json;
    }

    /**
     * @param mixed $json
     * @return Configuration
     */
    public function setJson($json)
    {
        $this->json = $json;
        return $this;
    }
}

