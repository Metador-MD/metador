<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Writer;

use WhereGroup\CoreBundle\Component\Utils\Import\Context\Context;

/**
 * Interface Writer
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Writer
 */
interface Writer
{
    /**
     * @param Context $context
     * @return Writer
     */
    public function open(Context $context): Writer;

    /**
     * @param iterable $items
     */
    public function write($items);
}
