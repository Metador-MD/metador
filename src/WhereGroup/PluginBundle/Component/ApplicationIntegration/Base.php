<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

use WhereGroup\CoreBundle\Component\Application;

abstract class Base
{
    protected $app                = null;
    protected $prefix             = null;
    protected $role               = null;
    protected $data               = array();
    protected $conditionsComplied = true;

    public function __construct(Application $app, $prefix = null)
    {
        $this->app = $app;

        if (is_null($prefix)) {
            $this->prefix = md5(microtime(true) . rand(0, 10000000));
        }
    }

    public function __destruct()
    {
        unset($app);
    }

    public function checkCondition($condition)
    {
        if ($this->conditionsComplied === true) {
            $this->conditionsComplied = (boolean)$condition;
        }
    }

    public function add()
    {
        if ($this->conditionsComplied === false) {
            return false;
        }

        return $this->app->add(
            $this->type,
            $this->prefix,
            $this->data,
            $this->role
        );
    }

    public function prepend()
    {
        if ($this->conditionsComplied === false) {
            return false;
        }

        return $this->app->prepend(
            $this->type,
            $this->prefix,
            $this->data,
            $this->role
        );
    }

    public function append()
    {
        if ($this->conditionsComplied === false) {
            return false;
        }

        return $this->app->append(
            $this->type,
            $this->prefix,
            $this->data,
            $this->role
        );
    }
}
