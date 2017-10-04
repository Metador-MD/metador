<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\ORM\EntityManagerInterface;

/**
 * Interface SourceInterface
 * @package WhereGroup\CoreBundle\Component
 */
interface SourceInterface
{
    /**
     * ConfigurationInterface constructor.
     * @param EntityManagerInterface $em
     */
    public function __construct(EntityManagerInterface $em);

    public function __destruct();
}
