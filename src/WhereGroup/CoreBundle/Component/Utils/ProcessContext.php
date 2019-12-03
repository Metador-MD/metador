<?php

namespace WhereGroup\CoreBundle\Component\Utils;

use RuntimeException;

/**
 * Class ProcessContext
 * @package WhereGroup\CoreBundle\Component\Utils
 */
class ProcessContext
{
    protected $totalItemCount;
    protected $command;
    protected $partitionSize = 10000;
    protected $range = 1;

    /**
     * ProcessContext constructor.
     * @param $command
     */
    public function __construct($command)
    {
        $this->command = $command;
    }

    /**
     * @return array
     */
    public function getCommand()
    {
        if ($this->totalItemCount === null) {
            throw new RuntimeException("totalItemCount can not be null.");
        }

        // @codingStandardsIgnoreStart
        return [
            'php', 'bin/console', $this->command, '--offset', (string)$this->range, '--limit', (string)$this->partitionSize
        ];
        // @codingStandardsIgnoreEnd
    }

    /**
     * @return mixed
     */
    public function getTotalItemCount()
    {
        return $this->totalItemCount;
    }

    /**
     * @param mixed $totalItemCount
     * @return ProcessContext
     */
    public function setTotalItemCount($totalItemCount)
    {
        $this->totalItemCount = $totalItemCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getPartitionSize(): int
    {
        return $this->partitionSize;
    }

    /**
     * @param int $partitionSize
     * @return ProcessContext
     */
    public function setPartitionSize(int $partitionSize): ProcessContext
    {
        $this->partitionSize = $partitionSize;

        return $this;
    }

    /**
     * @return int
     */
    public function getRange(): int
    {
        return $this->range;
    }

    /**
     * @param int $range
     * @return ProcessContext
     */
    public function setRange(int $range): ProcessContext
    {
        $this->range = $range;

        return $this;
    }

    public function valid(): bool
    {
        return ($this->range < $this->totalItemCount);
    }

    /**
     * @return ProcessContext
     */
    public function next(): ProcessContext
    {
        $this->range += $this->partitionSize;

        return $this;
    }
}
