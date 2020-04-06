<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Reader;

use Generator;
use RuntimeException;
use WhereGroup\CoreBundle\Component\Search\JsonFilterReader;
use WhereGroup\CoreBundle\Component\Search\PropertyNameNotFoundException;
use WhereGroup\CoreBundle\Component\Search\Search;
use WhereGroup\CoreBundle\Component\Utils\Import\Context\DatabaseContext;

/**
 * Class MetadataReader
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Reader
 */
class MetadataReader implements Reader
{
    /** @var Search */
    public $search;
    public $source;
    public $filter;

    /**
     * @param DatabaseContext $context
     * @return MetadataReader
     */
    public function open($context)
    {
        $reader = clone $this;

        $reader->search = $context->getService();
        $reader->source = $context->getSource();
        $reader->filter = $context->getFilter();

        return $reader;
    }

    /**
     * @param null $offset
     * @param null $limit
     * @return Generator
     * @throws PropertyNameNotFoundException
     */
    public function read($offset = null, $limit = null): Generator
    {
        if (!$this->search) {
            throw new RuntimeException("Run open() method first.");
        }

        $rows = $this->search
            ->setHits($limit)
            ->setOffset($offset)
            ->setSource($this->source)
            ->setSort('id')
            ->setExpression(JsonFilterReader::read($this->filter, $this->search->createExpression()))
            ->find();

        if (!isset($rows['rows'])) {
            $rows['rows'] = [];
        }

        $count = 0;

        foreach ($rows['rows'] as $row) {
            yield $count => json_decode($row['object'], true);
            ++$count;
        }
    }

    public function close()
    {
        unset($this->search);
    }
}
