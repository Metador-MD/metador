<?php

namespace WhereGroup\MetadorBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Interface MetadorUserInterface
 * @package WhereGroup\MetadorBundle\Component
 */
interface MetadorUserInterface
{
    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container);
}
