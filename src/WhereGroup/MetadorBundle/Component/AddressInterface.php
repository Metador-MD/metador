<?php

namespace WhereGroup\MetadorBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Interface AddressInterface
 * @package WhereGroup\MetadorBundle\Component
 */
interface AddressInterface
{
    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container);

    /**
     * @return mixed
     */
    public function get();

    /**
     * @param $metadataObject
     * @return mixed
     */
    public function set($metadataObject);
}
