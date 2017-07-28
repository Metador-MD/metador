<?php
/**
 * Created by PhpStorm.
 * User: paul
 * Date: 03.05.17
 * Time: 09:57
 */

namespace Plugins\WhereGroup\MapBundle\Component;

use Doctrine\ORM\EntityManagerInterface;
use WhereGroup\CoreBundle\Component\Utils\Browser;

/**
 * Interface MapInterface
 * @package Plugins\WhereGroup\MapBundle\Component
 */
interface MapInterface
{
    /**
     * ConfigurationInterface constructor.
     * @param EntityManagerInterface $em
     * @param Browser $browser
     */
    public function __construct(EntityManagerInterface $em, Browser $browser);

    public function __destruct();
}
