<?php

namespace Plugins\WhereGroup\AddressBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Controller\DashboardController;
use WhereGroup\PluginBundle\Component\ApplicationIntegration;
use WhereGroup\PluginBundle\Component\ApplicationIntegration\Script;
use WhereGroup\PluginBundle\Component\ApplicationIntegration\Dashboard;
use Plugins\WhereGroup\AddressBundle\Component\AddressInterface;

/**
 * Class ApplicationListener
 * @package Plugins\WhereGroup\AddressBundle\EventListener
 * @author A.R.Pour
 */
class ApplicationListener
{
    protected $address = null;
    protected $prefix  = 'address';

    /**
     * @param AddressInterface $address
     */
    public function __construct(AddressInterface $address)
    {
        $this->address = $address;
    }

    public function __destruct()
    {
        unset($this->address);
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $dashboard = new Dashboard($app, $this->prefix);
        $dashboard
            ->setTemplate('WhereGroupAddressBundle::dashboardPreview.html.twig')
            ->setParams(array(
                'address' => $this->address->get()
            ))
            ->add();

        $script = new Script($app, $this->prefix);
        $script
            ->setFile('bundles/wheregroupaddress/address.js')
            ->add();

        unset($dashboard, $script);
    }
}
