<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

/**
 * Class Base
 * @package WhereGroup\PluginBundle\Component\ApplicationIntegration
 */
abstract class Base
{
    protected $data   = [];
    protected $role   = null;
    protected $prefix = null;

    /**
     * Base constructor.
     * @param $prefix
     */
    public function __construct($prefix)
    {
        $this->prefix = $this->generatePrefix($prefix);
    }

    /**
     * @param null $prefix
     * @return null
     */
    protected function generatePrefix($prefix = null)
    {
        return is_null($prefix)
            ? md5(microtime(true) . rand(1000000, 9999999))
            : $prefix;
    }

    /**
     * @param $template
     * @param array $params
     * @param null $prefix
     * @return $this
     */
    public function template($template, $params = [], $prefix = null)
    {
        $prefix = $this->generatePrefix($prefix);

        $this->data[$prefix]['template'] = $template;
        $this->data[$prefix]['params']   = $params;

        return $this;
    }

    /**
     * @param $raw
     * @param null $prefix
     * @return $this
     */
    public function raw($raw, $prefix = null)
    {
        $this->data[$this->generatePrefix($prefix)]['raw'] = $raw;
        return $this;
    }

    /**
     * @return array
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * @return mixed
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param $role
     * @return $this
     */
    public function setRole($role)
    {
        $this->role = $role;
        return $this;
    }

    /**
     * @return null
     */
    public function getRole()
    {
        return $this->role;
    }
}
