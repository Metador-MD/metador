<?php

namespace WhereGroup\CoreBundle\Component;

use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;

/**
 * Class Cache
 * @package WhereGroup\CoreBundle\Component
 */
class Cache
{
    private $cache;
    private $enabled;

    /**
     * Cache constructor.
     * @param $host
     * @param $port
     * @param $enabled
     * @throws MetadorException
     */
    public function __construct($host, $port, $enabled)
    {
        if (!$enabled) {
            $this->enabled = false;
            return;
        }

        if (!class_exists('Memcached')) {
            throw new MetadorException("Memcached not found.");
        }

        $this->cache = new \Memcached('persistent');

        if (!$this->cache->addServer($host, $port)) {
            throw new MetadorException("Could not connect to memcached server.");
        }

        $this->enabled = $enabled;
    }

    /**
     * @param $key
     * @return mixed
     */
    public function get($key)
    {
        if (!$this->enabled) {
            return false;
        }

        return $this->cache->get($key);
    }

    /**
     * @param $key
     * @param $value
     * @return bool|Cache
     */
    public function set($key, $value)
    {
        if (!$this->enabled) {
            return false;
        }

        $this->cache->set($key, $value);
        return $this;
    }

    /**
     * @return bool|Cache
     */
    public function truncate()
    {
        if (!$this->enabled) {
            return false;
        }
        $this->cache->flush();
        return $this;
    }

    /**
     * @param $key
     * @return bool|Cache
     */
    public function delete($key)
    {
        if (!$this->enabled) {
            return false;
        }

        $this->cache->delete($key);
        return $this;
    }

    /**
     * @return array|bool
     */
    public function stats()
    {
        if (!$this->enabled) {
            return false;
        }

        return $this->cache->getStats();
    }
}
