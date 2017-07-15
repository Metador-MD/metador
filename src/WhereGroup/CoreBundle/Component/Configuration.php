<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\ORM\EntityManagerInterface;

/**
 * Class Configuration
 * @package WhereGroup\CoreBundle\Component
 */
class Configuration implements ConfigurationInterface
{
    protected $repo = null;

    const ENTITY = "MetadorCoreBundle:Configuration";

    /** @param EntityManagerInterface $em */
    public function __construct(EntityManagerInterface $em)
    {
        $this->repo = $em->getRepository(self::ENTITY);
    }

    public function __destruct()
    {
        unset(
            $this->repo
        );
    }

    /**
     * @param $key
     * @param $value
     * @param string $filterType
     * @param string $filterValue
     * @return $this|mixed
     */
    public function set($key, $value, $filterType = '', $filterValue = '')
    {
        $this->repo->set($key, $value, $filterType, $filterValue);
        return $this;
    }

    /**
     * @param $key
     * @param string $filterType
     * @param string $filterValue
     * @param null $default
     * @return mixed
     */
    public function get($key, $filterType = '', $filterValue = '', $default = null)
    {
        return $this->repo->getValue($key, $filterType, $filterValue, $default);
    }

    /**
     * @param $key
     * @param string $filterType
     * @param string $filterValue
     * @return mixed
     */
    public function remove($key, $filterType = '', $filterValue = '')
    {
        return $this->repo->remove($key, $filterType, $filterValue);
    }

    /**
     * @param string $filterType
     * @param string $filterValue
     * @return mixed
     */
    public function findAll($filterType = '', $filterValue = '')
    {
        return $this->repo->all($filterType, $filterValue);
    }

    /**
     * @param string $filterType
     * @param string $filterValue
     * @return mixed
     */
    public function removeAll($filterType = '', $filterValue = '')
    {
        return $this->repo->removeAll($filterType, $filterValue);
    }
}
