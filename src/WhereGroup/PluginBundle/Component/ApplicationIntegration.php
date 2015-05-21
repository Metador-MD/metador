<?php

namespace WhereGroup\PluginBundle\Component;

abstract class ApplicationIntegration
{
    protected function addToScripts($script)
    {
        $this->app->add('app-javascript', $this->prefix, array(
            'src' => $script
        ));

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
