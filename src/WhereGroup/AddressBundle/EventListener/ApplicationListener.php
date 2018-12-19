<?php

namespace WhereGroup\AddressBundle\EventListener;

use WhereGroup\AddressBundle\Component\Address;
use WhereGroup\CoreBundle\Component\Configuration;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package WhereGroup\AddressBundle\EventListener
 */
class ApplicationListener
{
    protected $address;
    protected $configuration;

    /**
     * ApplicationListener constructor.
     * @param Address $address
     * @param Configuration $configuration
     */
    public function __construct(Address $address, Configuration $configuration)
    {
        $this->address = $address;
        $this->configuration = $configuration;
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
        $conf = $this->configuration->get('administration', 'plugin', 'metador_core', []);

        if (!is_array($conf)) {
            $conf = [];
        }

        if ($app->routeStartsWith('metador_admin') && in_array('address', $conf)) {
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
