<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Reader;

use Generator;
use RuntimeException;
use Symfony\Component\Finder\Finder;
use WhereGroup\CoreBundle\Component\Utils\Import\Context\Context;

/**
 * Class FolderReader
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Reader
 */
class FolderReader implements Reader
{
    /** @var Finder */
    public $finder;

    /**
     * @param Context $context
     * @return FolderReader
     */
    public function open($context)
    {
        $reader = clone $this;
        $reader->finder = new Finder();
        $reader->finder
            ->files()
            ->name($context->getName())
            ->in($context->getFolder())
        ;
        return $reader;
    }

    /**
     * @param null $offset
     * @param null $limit
     * @return Generator
     */
    public function read($offset = null, $limit = null): Generator
    {
        if (!$this->finder) {
            throw new RuntimeException("Run open() method first.");
        }

        $count = 0;
        $seek  = 1;

        foreach ($this->finder as $file) {
            if ($offset !== null && $seek < $offset) {
                ++$seek;
                continue;
            } elseif ($limit !== null && $count + 1 > $limit) {
                break;
            }
            yield $count => [
                'filename' => $file->getFilename(),
                'filepath' => $file->getRealPath(),
                'content'  => $file->getContents()
            ];
            ++$count;
        }
    }

    public function close()
    {
        unset($this->finder);
    }
}
