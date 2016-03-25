<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

abstract class Base
{
    protected $data   = array();
    protected $role   = null;
    protected $prefix = null;

    public function __construct($prefix)
    {
        $this->prefix = $prefix;
    }

    protected function generatePrefix($prefix = null)
    {
        return is_null($prefix)
            ? md5(microtime(true) . rand(1000000, 9999999))
            : $prefix;
    }

    public function template($template, $params = array(), $prefix = null)
    {
        $prefix = $this->generatePrefix($prefix);

        $this->data[$prefix]['template'] = $template;
        $this->data[$prefix]['params']   = $params;

        return $this;
    }

    public function raw($raw, $prefix = null)
    {
        $this->data[$this->generatePrefix($prefix)]['raw'] = $raw;
        return $this;
    }

    public function getData()
    {
        return $this->data;
    }

    public function getType()
    {
        return $this->type;
    }

    public function setRole($role)
    {
        $this->role = $role;
        return $this;
    }

    public function getRole()
    {
        return $this->role;
    }
}
