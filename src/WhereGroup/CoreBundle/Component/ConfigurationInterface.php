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
     * @param Cache $cache
     */
    public function __construct(EntityManagerInterface $em, Cache $cache);

    public function __destruct();

    /**
     * @param $key
     * @param $value
     * @param string $filterType
     * @param string $filterValue
     * @return mixed
     */
    public function set($key, $value, $filterType = '', $filterValue = '');

    /**
     * @param $key
     * @param null|string $filterType
     * @param null|string $filterValue
     * @param null $default
     * @return mixed
     */
    public function get($key, $filterType = null, $filterValue = null, $default = null);

    /**
     * @param $key
     * @param string $filterType
     * @param string $filterValue
     * @return mixed
     */
    public function remove($key, $filterType = null, $filterValue = null);

    /**
     * @param string $filterType
     * @param string $filterValue
     * @return mixed
     */
    public function getAll($filterType = null, $filterValue = null);

    /**
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function getValues($filterType = null, $filterValue = null);

    /**
     * @param string $filterType
     * @param string $filterValue
     * @return mixed
     */
    public function removeAll($filterType = null, $filterValue = null);
}
