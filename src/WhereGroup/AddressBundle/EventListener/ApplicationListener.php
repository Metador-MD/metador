<?php

namespace WhereGroup\AddressBundle\EventListener;

use WhereGroup\AddressBundle\Component\Address;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package WhereGroup\AddressBundle\EventListener
 */
class ApplicationListener
{
    protected $address;

    /**
     * ApplicationListener constructor.
     * @param Address $address
     */
    public function __construct(Address $address)
    {
        $this->address = $address;
    }

    public function __destruct()
    {
        unset($this->address);
    }

    /**
     * @param ApplicationEvent $event
     * @throws \Exception
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        if ($app->routeStartsWith('metador_admin')) {
            $app->add(
                $app->get('AdminMenu', 'address')
                    ->icon('icon-address-book')
                    ->label('Adressen')
                    ->path('metador_admin_address')
                    ->active($app->routeStartsWith('metador_admin_address'))
                    ->setRole('ROLE_SYSTEM_GEO_OFFICE')
            );

            if ($app->isRoute('metador_admin_index')) {
                $app->add(
                    $app->get('AppInformation', 'address-info')
                        ->icon('icon-address-book')
                        ->label('Adressen')
                        ->count($this->address->count())
                        ->setRole('ROLE_SYSTEM_GEO_OFFICE')
                );
            }
        }

        $app->append(
            $app->get('Script')->file('bundles/metadoraddress/address.js')
        );
    }
}
