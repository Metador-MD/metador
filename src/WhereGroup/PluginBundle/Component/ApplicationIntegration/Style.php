<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

use WhereGroup\CoreBundle\Component\Application;

class Style extends Base
{
    protected $type  = 'app-css';

    public function __construct(Application $app, $prefix = null)
    {
        parent::__construct($app, $prefix);

        $this->data = array(
            'template' => '',
            'params'   => array(),
            'file'     => ''
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

    public function setFile($file)
    {
        $this->data['file'] = $file;
        return $this;
    }
}
