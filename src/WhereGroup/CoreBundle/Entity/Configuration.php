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
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filterType;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filterValue;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $key;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $value;

    /**
     * Configuration constructor.
     * @param $filterType
     * @param $filterValue
     * @param $key
     * @param $value
     */
    public function __construct($filterType, $filterValue, $key, $value)
    {
        $this->filterType = $filterType;
        $this->filterValue = $filterValue;
        $this->key = $key;
        $this->value = $value;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

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
        return $this->value;
    }

    /**
     * @param $value
     * @return $this
     */
    public function setValue($value)
    {
        $this->value = $value;
        return $this;
    }

}
