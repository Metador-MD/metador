<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Reader;

use Generator;
use WhereGroup\CoreBundle\Component\Utils\Import\Context\Context;

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
    public function open(Context $context): Reader;

    /**
     * @return Generator
     */
    public function read(): Generator;
}
