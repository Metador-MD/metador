<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

/**
 * Class Style
 * @package WhereGroup\PluginBundle\Component\ApplicationIntegration
 */
class Style extends Base
{
    protected $type  = 'app-css';

    /**
     * @param $file
     * @param null $prefix
     * @return $this
     */
    public function file($file, $prefix = null)
    {
        $this->data[$this->generatePrefix($prefix)]['file'] = $file;
        return $this;
    }
}
