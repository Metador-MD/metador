<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

class Profile extends Base
{
    protected $type = 'app-profile';

    public function name($name)
    {
        $this->data[$this->prefix]['name'] = $name;
        return $this;
    }

    public function active($active)
    {
        $this->data[$this->prefix]['active'] = $active;
        return $this;
    }
}
