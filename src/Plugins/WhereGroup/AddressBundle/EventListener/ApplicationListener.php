<?php

namespace Plugins\WhereGroup\AddressBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Controller\DashboardController;
use Plugins\WhereGroup\AddressBundle\Component\AddressInterface;

/**
 * Class ApplicationListener
 * @package Plugins\WhereGroup\AddressBundle\EventListener
 * @author A.R.Pour
 */
class ApplicationListener
{
    protected $address = null;

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

        $app->add(
            $app->get('Dashboard')
                ->template(
                    'MetadorAddressBundle::dashboardPreview.html.twig',
                    array('address' => $this->address->get())
                )
        )->add(
            $app->get('Script')
                ->file('bundles/metadoraddress/address.js')
        );
    }
}
