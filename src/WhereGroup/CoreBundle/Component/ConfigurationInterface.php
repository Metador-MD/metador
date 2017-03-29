<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\ORM\EntityManagerInterface;

/**
 * Class ConfigurationInterface
 * @package WhereGroup\CoreBundle\Component
 */
interface ConfigurationInterface
{
    /**
     * ConfigurationInterface constructor.
     * @param EntityManagerInterface $em
     */
    public function __construct(EntityManagerInterface $em);

    public function __destruct();

    /**
     * @param $key
     * @param $value
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function set($key, $value, $filterType = null, $filterValue = null);

    /**
     * @param $key
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function get($key, $filterType = null, $filterValue = null);

    /**
     * @param $key
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function remove($key, $filterType = null, $filterValue = null);

    /**
     * @param $key
     * @param null $filterType
     * @param null $filterValue
     * @param null $default
     * @return mixed
     */
    public function getValue($key, $filterType = null, $filterValue = null, $default = null);

    /**
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function findAll($filterType = null, $filterValue = null);

    /**
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function removeAll($filterType = null, $filterValue = null);
}
