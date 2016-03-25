<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

class Script extends Base
{
    protected $type  = 'app-javascript';

    public function file($file, $prefix = null)
    {
        $this->data[$this->generatePrefix($prefix)] = $file;
        return $this;
    }
}
