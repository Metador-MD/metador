<?php

namespace WhereGroup\MetadorBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;

interface MetadorUserInterface {
    public function __construct(ContainerInterface $container);
}