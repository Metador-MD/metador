<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import;

use Symfony\Component\Process\Process;

/**
 * Class ProcessManager
 * @package WhereGroup\CoreBundle\Component\Utils
 */
class ProcessManager
{
    private $processes = [];
    private $processLimit = 5;
    private $processContext;
    /**
     * ProcessManager constructor.
     * @param ProcessContext $processContext
     */
    public function __construct(ProcessContext $processContext)
    {
        $this->processContext = $processContext;
    }

    /**
     * @param int $limit
     * @return ProcessManager
     */
    public function setProcessLimit($limit = 5)
    {
        if ((int)$limit < 1) {
            $limit = 1;
        } elseif ((int)$limit > 5) {
            $limit = 5;
        }

        $this->processLimit = (int)$limit;
        return $this;
    }

    /**
     * Run processes
     */
    public function run()
    {
        while ($this->processContext->valid()) {
            // Wait for free process
            while (count($this->processes) >= $this->processLimit) {
                $this->clearFinishedProcesses();
            }

            $process = new Process($this->processContext->getCommand());
            $process->start();

            $this->processes[] = $process;
            $this->processContext->next();
        }

        // Wait until all processes finished.
        while (count($this->processes) !== 0) {
            $this->clearFinishedProcesses();
        }
    }

    /**
     * Clear finished processes
     */
    private function clearFinishedProcesses()
    {
        sleep(1);
        foreach ($this->processes as $index => $process) {
            if (!$process->isRunning()) {
                unset($this->processes[$index]);
            }
        }
    }
}
