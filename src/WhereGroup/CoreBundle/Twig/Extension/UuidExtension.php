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
            'uuid' => new \Twig_Function_Method($this, 'uuid'),
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
