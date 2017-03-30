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
     * @param null $filterType
     * @param null $filterValue
     * @return $this|mixed
     */
    public function set($key, $value, $filterType = null, $filterValue = null)
    {
        $this->repo->set($key, $value, $filterType, $filterValue);
        return $this;
    }

    /**
     * @param $key
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function get($key, $filterType = null, $filterValue = null)
    {
        return $this->repo->get($key, $filterType, $filterValue);
    }

    /**
     * @param $key
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function remove($key, $filterType = null, $filterValue = null)
    {
        return $this->repo->remove($key, $filterType, $filterValue);
    }

    /**
     * @param $key
     * @param null $filterType
     * @param null $filterValue
     * @param null $default
     * @return mixed
     */
    public function getValue($key, $filterType = null, $filterValue = null, $default = null)
    {
        return $this->repo->getValue($key, $filterType, $filterValue, $default);
    }

    /**
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function findAll($filterType = null, $filterValue = null)
    {
        return $this->repo->all($filterType, $filterValue);
    }

    /**
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function removeAll($filterType = null, $filterValue = null)
    {
        return $this->repo->removeAll($filterType, $filterValue);
    }
}
