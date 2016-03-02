<?php

namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

use WhereGroup\CoreBundle\Component\Application;

class Script extends Base
{
    protected $type  = 'app-javascript';

    public function __construct(Application $app, $prefix = null)
    {
        parent::__construct($app, $prefix);
    }

    public function setFile($file)
    {
        $this->data = $file;
        return $this;
    }
}
