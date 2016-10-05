<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

/**
 * Class AppInformation
 * @package WhereGroup\PluginBundle\Component\ApplicationIntegration
 */
class AppInformation extends Base
{
    protected $type = 'app-information';

    /**
     * @param $message
     * @param null $prefix
     * @return $this
     */
    public function warning($message, $prefix = null)
    {
        $prefix = $this->generatePrefix($prefix);
        $this->data[$prefix]['icon'] = 'icon-notification';
        $this->data[$prefix]['label'] = $message;
        return $this;
    }
}
