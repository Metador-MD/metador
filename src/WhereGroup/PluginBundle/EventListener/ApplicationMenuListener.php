<?php

namespace WhereGroup\PluginBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationMenuListener
 * @package WhereGroup\PluginBundle\EventListener
 * @author A.R.Pour
 */
class ApplicationMenuListener
{
    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        /***********************************************************************
         * Admin Menu
         ***********************************************************************/
        $app->add('app-admin-menu', 'plugin', array(
            'icon'   => 'icon-stack',
            'label'  => 'Plugins',
            'path'   => 'metador_admin_plugin',
            'params' => array()
        ), 'ROLE_SUPERUSER');

        if ($app->isBundle('plugin')) {
            $app->add('app-plugin-menu', 'save', array(
                'label'  => 'speichern',
                'icon'   => 'icon-floppy-disk'
            ));
        }
    }
}
