<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

class ProfileTable extends Base
{
    protected $type = 'app-profile-table';

    public function headerLabel($label)
    {
        $this->data[$this->prefix]['header']['label'] = $label;
        return $this;
    }

    public function headerClass($class)
    {
        $this->data[$this->prefix]['header']['class'] = $class;
        return $this;
    }

    public function headerIcon($icon)
    {
        $this->data[$this->prefix]['header']['icon'] = $icon;
        return $this;
    }

    public function bodyTemplate($template, $params = array())
    {
        $this->data[$this->prefix]['body']['template'] = $template;
        $this->data[$this->prefix]['body']['params'] = $params;
        return $this;
    }
}
