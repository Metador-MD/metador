<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\ORM\EntityManagerInterface;
use WhereGroup\CoreBundle\Component\Cache;

/**
 * Class Configuration
 * @package WhereGroup\CoreBundle\Component
 */
class Configuration implements ConfigurationInterface
{
    protected $repo;

    /** @var \WhereGroup\CoreBundle\Component\Cache  */
    protected $cache;

    const ENTITY = "MetadorCoreBundle:Configuration";

    /**
     * @param EntityManagerInterface $em
     * @param \WhereGroup\CoreBundle\Component\Cache $cache
     */
    public function __construct(EntityManagerInterface $em, Cache $cache)
    {
        $this->repo = $em->getRepository(self::ENTITY);
        $this->cache = $cache;
    }

    public function __destruct()
    {
        unset(
            $this->repo,
            $this->cache
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
        $this->cache->set($this->generateKey($key, $filterType, $filterValue), $value);
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
        $cacheKey = $this->generateKey($key, $filterType, $filterValue);
        $value = $this->cache->get($cacheKey);

        if (!$value) {
            $value = $this->repo->getValue($key, $filterType, $filterValue, $default);
            $this->cache->set($cacheKey, $value);
        }

        return $value;
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
        $this->cache->delete($this->generateKey($key, $filterType, $filterValue));
        return $this;
    }

    /**
     * @param string $filterType
     * @param string $filterValue
     * @return mixed
     */
    public function getAll($filterType = null, $filterValue = null)
    {
        $cacheKey = $this->generateKey('', $filterType, $filterValue);
        $values = $this->get($cacheKey);

        if (!$values) {
            $values = $this->repo->all($filterType, $filterValue);
            $this->set($cacheKey, $values);
        }

        return $values;
    }

    /**
     * @param null $filterType
     * @param null $filterValue
     * @return array
     */
    public function getValues($filterType = null, $filterValue = null)
    {
        $cacheKey = $this->generateKey('', $filterType, $filterValue);
        $config = $this->cache->get($cacheKey);

        if (!$config) {
            $config = array();

            foreach ($this->getAll($filterType, $filterValue) as $row) {
                $config[$row['key']] = $row['value'];
            }

            $this->cache->set($cacheKey, $config);
        }

        return $config;
    }

    /**
     * @param string $filterType
     * @param string $filterValue
     * @return $this
     */
    public function removeAll($filterType = null, $filterValue = null)
    {
        $this->repo->removeAll($filterType, $filterValue);
        $this->cache->truncate();
        return $this;
    }

    /**
     * @return $this
     */
    public function truncate()
    {
        $this->repo->truncate();
        $this->cache->truncate();
        return $this;
    }

    /**
     * @param string $key
     * @param string $filterType
     * @param string $filterValue
     * @return string
     */
    private function generateKey($key = '', $filterType = '', $filterValue = '')
    {
        return 'configuration-' . $key . '-' . $filterType . '-' . $filterValue;
    }
}
