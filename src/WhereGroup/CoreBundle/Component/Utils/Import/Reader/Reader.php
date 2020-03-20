<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Reader;

use Generator;

/**
 * Interface Reader
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Reader
 */
interface Reader
{
    /**
     * @param $context
     * @return Reader
     */
    public function open($context);

    /**
     * @return Generator
     */
    public function read(): Generator;
}
