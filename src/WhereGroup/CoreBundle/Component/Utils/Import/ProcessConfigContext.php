<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import;

use RuntimeException;
use WhereGroup\CoreBundle\Component\Utils\Import\ProcessContext as BaseClass;

/**
 * Class ProcessConfigContext
 * @package WhereGroup\CoreBundle\Component\Utils\Import
 */
class ProcessConfigContext extends BaseClass
{
    private $id;
    private $rootDir;

    public function getCommand()
    {
        if ($this->totalItemCount === null) {
            throw new RuntimeException("totalItemCount can not be null.");
        }

        // @codingStandardsIgnoreStart
        return [
            'php', realpath($this->rootDir . '/../' . 'bin/console'), $this->command,
            '--offset', (string)$this->range,
            '--limit', (string)$this->partitionSize,
            $this->id
        ];
        // @codingStandardsIgnoreEnd
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     * @return ProcessConfigContext
     */
    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getRootDir()
    {
        return $this->rootDir;
    }

    /**
     * @param mixed $rootDir
     * @return ProcessConfigContext
     */
    public function setRootDir($rootDir)
    {
        $this->rootDir = $rootDir;

        return $this;
    }
}
