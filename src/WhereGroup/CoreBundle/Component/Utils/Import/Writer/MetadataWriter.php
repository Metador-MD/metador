<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Writer;

use Exception;
use Plugins\WhereGroup\ImportBundle\Entity\ImportExport;
use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\CoreBundle\Service\Database;
use WhereGroup\CoreBundle\Component\Utils\Import\Context\Context;

/**
 * Class MetadataWriter
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Writer
 */
class MetadataWriter implements Writer
{
    /** @var Database */
    private $service;

    /** @var ImportExport */
    private $config;

    /**
     * @param Context $context
     * @return MetadataWriter
     */
    public function open(Context $context): Writer
    {
        $writer = clone $this;
        $writer->config   = $context->getConfig();
        $writer->service  = $context->getService();
        return $writer;
    }

    /**
     * @param iterable $items
     * @return bool
     */
    public function write($items)
    {
        try {
            $this->service->disableSqlLogger();

            /** @var Metadata $entity */
            foreach ($items as $entity) {
                $this->service->persist($entity);
            }

            $this->service->dispatchFlush();
        } catch (Exception $e) {
            return false;
        }

        return true;
    }
}
