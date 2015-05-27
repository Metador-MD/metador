<?php

namespace WhereGroup\Plugin\ImportBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\PluginBundle\Component\ApplicationIntegration;

/**
 * Class ApplicationListener
 * @package WhereGroup\Plugin\PublishBundle\EventListener
 * @author A.R.Pour
 */
class ApplicationListener extends ApplicationIntegration
{
    protected $app     = null;
    protected $prefix  = 'import';
    protected $exportPath = null;

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $this->app = $event->getApplication();

        if ($this->app->isController('Profile') && $this->app->isAction('index')) {
            $bundle  = strtolower($this->app->getBundle());

            $this->app->add('app-plugin-menu', 'import', array(
                'label'  => 'Import',
                'icon'   => 'icon-upload',
                'path'   => 'metador_import_index',
                'params' => array(
                    'profile' => strstr($bundle, 'profile') !== false
                        ? substr($bundle, strlen('profile'))
                        : 'dataset'
                )
            ));
        }
    }
}
