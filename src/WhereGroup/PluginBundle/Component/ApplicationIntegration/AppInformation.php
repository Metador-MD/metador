<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

class AppInformation extends Base
{
    protected $type   = 'app-information';

    public function warning($message, $prefix = null)
    {
        $this->data[$this->generatePrefix($prefix)]['icon'] = 'icon-notification';
        $this->data[$this->generatePrefix($prefix)]['label'] = $message;
    }
}
