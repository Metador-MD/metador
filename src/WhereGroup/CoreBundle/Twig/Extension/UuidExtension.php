<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Rhumsaa\Uuid\Uuid;
use Rhumsaa\Uuid\Exception\UnsatisfiedDependencyException;

class UuidExtension extends \Twig_Extension
{
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('uuid', array($this, 'uuid')),
        );
    }

    public function getName()
    {
        return 'uuid_extension';
    }


    public function uuid()
    {
        $uuid4 = Uuid::uuid4();
        return $uuid4->toString();
    }
}
