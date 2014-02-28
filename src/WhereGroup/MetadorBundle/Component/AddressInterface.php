<?php

namespace WhereGroup\MetadorBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;

interface AddressInterface {
    public function __construct(ContainerInterface $container);
    public function get();
    public function set($metadataObject);
}