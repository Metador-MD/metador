<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

/**
 * Class GlobalMenu
 * @package WhereGroup\PluginBundle\Component\ApplicationIntegration
 */
class GlobalMenu extends Base
{
    protected $type   = 'app-global-menu';

    /**
     * @param $icon
     * @return $this
     */
    public function icon($icon)
    {
        $this->data[$this->prefix]['icon'] = $icon;
        return $this;
    }

    /**
     * @param $label
     * @return $this
     */
    public function label($label)
    {
        $this->data[$this->prefix]['label'] = $label;
        return $this;
    }

    /**
     * @param $path
     * @param array $params
     * @return $this
     */
    public function path($path, $params = array())
    {
        $this->data[$this->prefix]['path'] = $path;
        $this->data[$this->prefix]['params'] = $params;
        return $this;
    }

    /**
     * @param $active
     * @return $this
     */
    public function active($active)
    {
        $this->data[$this->prefix]['active'] = $active;
        return $this;
    }

    /**
     * @param $data
     * @return $this
     */
    public function data($data)
    {
        $this->data[$this->prefix]['data'] = $data;
        return $this;
    }

    /**
     * @param $target
     * @return $this
     */
    public function target($target)
    {
        $this->data[$this->prefix]['target'] = $target;
        return $this;
    }
}
