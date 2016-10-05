<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

/**
 * Class Profile
 * @package WhereGroup\PluginBundle\Component\ApplicationIntegration
 */
class Profile extends Base
{
    protected $type = 'app-profile';

    /**
     * @param $name
     * @return $this
     */
    public function name($name)
    {
        $this->data['name'] = $name;
        return $this;
    }

    /**
     * @param $active
     * @return $this
     */
    public function active($active)
    {
        $this->data['active'] = $active;
        return $this;
    }
}
