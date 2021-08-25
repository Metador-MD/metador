<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Writer;

use Exception;
use WhereGroup\CoreBundle\Component\Utils\Import\Context\FolderContext;

/**
 * Class FolderWriter
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Writer
 */
class FolderWriter implements Writer
{
    public $folder;
    public $overrideFile;

    /**
     * @param FolderContext $context
     * @return FolderWriter
     */
    public function open($context)
    {
        $writer = clone $this;
        $writer->folder = rtrim($context->getFolder(), '/') . '/';

        if (!is_writable($writer->folder)) {
            throw new Exception("Order " . $writer->folder . " hat nicht die nötigen Schreibrechte.");
        }

        $writer->overrideFile = $context->getOverrideFile();
        return $writer;
    }

    /**
     * @param iterable $items
     */
    public function write($items)
    {
        foreach ($items as $uuid => $xml) {
            file_put_contents($this->folder . $uuid . '.xml', $xml);
        }
    }

    /**
     * @param $uuid
     * @return bool
     */
    public function permissionToOverrideFile($uuid)
    {
        if ($this->overrideFile || !file_exists($this->folder . $uuid . '.xml')) {
            return true;
        }
        return false;
    }

    /**
     * @param $uuid
     * @return bool
     */
    public function fileExists($uuid)
    {
        return file_exists($this->folder . $uuid . '.xml');
    }
}
