<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Interface MetadorUserInterface
 * @package WhereGroup\CoreBundle\Component
 */
interface MetadorUserInterface
{
    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container);
}
