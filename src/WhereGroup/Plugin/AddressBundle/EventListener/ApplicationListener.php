<?php

namespace WhereGroup\Plugin\AddressBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\PluginBundle\Component\ApplicationIntegration;
use WhereGroup\Plugin\AddressBundle\Component\AddressInterface;

/**
 * Class ApplicationListener
 * @package WhereGroup\Plugin\AddressBundle\EventListener
 * @author A.R.Pour
 */
class ApplicationListener extends ApplicationIntegration
{
    protected $app     = null;
    protected $address = null;
    protected $prefix  = 'address';

    /**
     * @param AddressInterface $address
     */
    public function __construct(AddressInterface $address)
    {
        $this->address = $address;
    }

    /**
     *
     */
    public function __destruct()
    {
        unset($this->address);
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $this->app = $event->getApplication();

        $this
            ->addToDashboard(
                // Template
                'WhereGroupAddressBundle::dashboardPreview.html.twig',
                // Params
                array(
                    'address' => $this->address->get()
                )
            )->addToScripts('bundles/wheregroupaddress/address.js');
    }
}
