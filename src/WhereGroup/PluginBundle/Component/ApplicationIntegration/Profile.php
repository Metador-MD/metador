<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

class Profile extends Base
{
    protected $type = 'app-profile';

    public function name($name)
    {
        $this->data['name'] = $name;
        return $this;
    }

    public function active($active)
    {
        $this->data['active'] = $active;
        return $this;
    }
}
