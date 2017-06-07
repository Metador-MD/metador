<?php
/**
 * Created by PhpStorm.
 * User: paul
 * Date: 03.05.17
 * Time: 09:57
 */

namespace Plugins\WhereGroup\MapBundle\Component;

use Doctrine\ORM\EntityManagerInterface;

interface MapInterface
{
    /**
     * ConfigurationInterface constructor.
     * @param EntityManagerInterface $em
     */
    public function __construct(EntityManagerInterface $em);

    public function __destruct();
}
