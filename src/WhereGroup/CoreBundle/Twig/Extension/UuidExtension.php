<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Rhumsaa\Uuid\Uuid;

/**
 * Class UuidExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class UuidExtension extends \Twig_Extension
{
    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('uuid', array($this, 'uuid')),
        );
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'uuid_extension';
    }

    /**
     * @return string
     */
    public function uuid()
    {
        $uuid4 = Uuid::uuid4();
        return $uuid4->toString();
    }
}
