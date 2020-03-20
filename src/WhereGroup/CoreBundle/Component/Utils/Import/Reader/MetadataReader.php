<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Reader;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Generator;
use RuntimeException;
use WhereGroup\CoreBundle\Component\Utils\Import\Context\DatabaseContext;
use WhereGroup\CoreBundle\Entity\MetadataRepository;

/**
 * Class MetadataReader
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Reader
 */
class MetadataReader implements Reader
{
    /** @var MetadataRepository */
    public $repository;
    public $source;

    /**
     * @param DatabaseContext $context
     * @return MetadataReader
     */
    public function open($context)
    {
        $reader = clone $this;

        /** @var Registry $doctrine */
        $doctrine = $context->getService();
        $reader->repository = $doctrine->getRepository($context->getEntityName());
        $reader->source = $context->getSource();

        return $reader;
    }

    /**
     * @param null $offset
     * @param null $limit
     * @return Generator
     */
    public function read($offset = null, $limit = null): Generator
    {
        if (!$this->repository) {
            throw new RuntimeException("Run open() method first.");
        }

        $rows = $this->repository
            ->createQueryBuilder('m')
            ->select('m.object')
            ->where('m.source = :source')
            ->setParameter('source', $this->source)
            ->orderBy('m.id')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getArrayResult()
        ;

        $count = 0;

        foreach ($rows as $row) {
            yield $count => json_decode($row['object'], true);
            ++$count;
        }
    }

    public function close()
    {
        unset($this->repository);
    }
}
