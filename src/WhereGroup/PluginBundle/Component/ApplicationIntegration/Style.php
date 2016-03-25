<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

class Style extends Base
{
    protected $type  = 'app-css';

    public function file($file, $prefix = null)
    {
        $this->data[$this->generatePrefix($prefix)]['file'] = $file;
        return $this;
    }
}
