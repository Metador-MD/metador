<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

use WhereGroup\PluginBundle\Component\ApplicationIntegration\Base;
use WhereGroup\CoreBundle\Component\Application;

class Body extends Base
{
    protected $type = 'app-body';

    public function __construct(Application $app, $prefix = null)
    {
        parent::__construct($app, $prefix);

        $this->data = array(
            'template' => '',
            'params'   => array()
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
