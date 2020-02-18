<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Context;

/**
 * Interface Context
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Context
 */
interface Context
{
    public function getService();
    public function setService($service);
}
