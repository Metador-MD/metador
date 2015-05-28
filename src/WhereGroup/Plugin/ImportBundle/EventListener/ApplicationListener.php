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

        $bundle  = strtolower($this->app->getBundle());
        $profile = strstr($bundle, 'profile') !== false
                    ? substr($bundle, strlen('profile'))
                    : 'dataset';

        if ($this->app->isController('Profile')) {
            if ($this->app->isAction('index')) {
                $this->app->add('app-plugin-menu', 'import', array(
                    'label'  => 'Import',
                    'icon'   => 'icon-upload',
                    'path'   => 'metador_import_index',
                    'params' => array(
                        'profile' => $profile
                    )
                ));

            } elseif ($this->app->isAction('edit') && $this->app->isEnv('dev')) {
                $this->app->add('app-plugin-menu', 'import-test', array(
                    'label'  => 'Test-Import',
                    'icon'   => 'icon-accessibility',
                    'path'   => 'metador_import_test',
                    'params' => array(
                        'profile' => $profile,
                        'id'      => $this->app->getParameter('id', 0)
                    )
                ));
            }
        }
    }
}
