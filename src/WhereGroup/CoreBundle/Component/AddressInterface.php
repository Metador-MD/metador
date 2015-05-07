<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Interface AddressInterface
 * @package WhereGroup\CoreBundle\Component
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
