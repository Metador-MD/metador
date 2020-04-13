<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Exception;
use Ramsey\Uuid\Uuid;
use Twig_Extension;
use Twig_SimpleFunction;

/**
 * Class UuidExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class UuidExtension extends Twig_Extension
{
    /**
     * @return array
     */
    public function getFunctions()
    {
        return [
            new Twig_SimpleFunction('uuid', [$this, 'uuid']),
        ];
    }

    /**
     * @return string
     * @throws Exception
     */
    public function uuid()
    {
        $uuid4 = Uuid::uuid4();
        return $uuid4->toString();
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_uuid";
    }
}
