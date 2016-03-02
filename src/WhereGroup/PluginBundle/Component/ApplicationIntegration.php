<?php

namespace WhereGroup\PluginBundle\Component;

// TODO: REMOVE ME
abstract class ApplicationIntegration
{
    protected function addToWarnings($icon, $message)
    {
        if ($this->app->isRoute('metador_admin_index')) {
            $this->app->add('app-information', md5($this->prefix . $message), array(
                'icon'  => $icon,
                'label' => $message
            ));
        }

        return $this;
    }

    protected function addToScripts($script)
    {
        $this->app->add('app-javascript', $this->prefix, $script);

        return $this;
    }

    protected function addToDashboard($template, $params)
    {
        if ($this->app->isController('dashboard')) {
            $this->app->add('app-preview', $this->prefix, array(
                'template' => $template,
                'params'   => $params
            ));
        }

        return $this;
    }
}
