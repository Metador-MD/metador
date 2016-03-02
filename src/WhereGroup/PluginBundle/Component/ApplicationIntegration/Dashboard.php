<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

use WhereGroup\CoreBundle\Component\Application;

class Dashboard extends Base
{
    protected $type  = 'app-preview';

    public function __construct(Application $app, $prefix = null)
    {
        parent::__construct($app, $prefix);

        $this->data = array(
            'template' => '',
            'params'   => array()
        );

        $this->checkCondition(
            $this->app->isController('dashboard')
        );
    }

    public function setTemplate($template)
    {
        $this->data['template'] = $template;
        return $this;
    }

    public function setParams($params)
    {
        $this->data['params'] = $params;
        return $this;
    }
}
