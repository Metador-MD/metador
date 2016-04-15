<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

/**
 * Class Configuration
 * @package WhereGroup\PluginBundle\Component\ApplicationIntegration
 */
class Configuration extends Base
{
    protected $type  = 'app-configuration';

    /**
     * @param $key
     * @param $value
     * @return mixed
     */
    public function parameter($key, $value)
    {
        $this->data[$key] = $value;
        return $this;
    }
}
