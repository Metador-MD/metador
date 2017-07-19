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
    public function get($key, $filterType = null, $filterValue = null, $default = null)
    {
        return $this->repo->getValue($key, $filterType, $filterValue, $default);
    }

    /**
     * @param $key
     * @param string $filterType
     * @param string $filterValue
     * @return $this
     */
    public function remove($key, $filterType = null, $filterValue = null)
    {
        $this->repo->remove($key, $filterType, $filterValue);

        return $this;
    }

    /**
     * @param string $filterType
     * @param string $filterValue
     * @return mixed
     */
    public function getAll($filterType = null, $filterValue = null)
    {
        return $this->repo->all($filterType, $filterValue);
    }

    /**
     * @param string $filterType
     * @param string $filterValue
     * @return $this
     */
    public function removeAll($filterType = null, $filterValue = null)
    {
        $this->repo->removeAll($filterType, $filterValue);

        return $this;
    }

    /**
     * @return $this
     */
    public function truncate()
    {
        $this->repo->truncate();

        return $this;
    }
}
