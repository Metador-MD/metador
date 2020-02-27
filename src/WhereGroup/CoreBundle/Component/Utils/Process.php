<?php

namespace WhereGroup\CoreBundle\Component\Utils;

use Exception;

/**
 * Class Process
 * @package WhereGroup\CoreBundle\Component\Utils
 */
class Process
{
    private $tempFolder;
    private $console;

    /**
     * Process constructor.
     * @param $tempFolder
     * @param $rootDir
     */
    public function __construct($tempFolder, $rootDir)
    {
        $this->tempFolder = $tempFolder;
        $this->console = realpath($rootDir  . '/../bin') . '/console';
    }

    /**
     * @param $command
     * @param null $handle
     * @return string
     */
    public function runInBackground($command, $handle = null)
    {
        if (is_null($handle)) {
            $handle = md5(microtime(true));
        }

        $path = $this->getProcessFilename($handle);

//        shell_exec(sprintf("nohup %s > %s 2>&1 & echo $! > %s &", $command, $path . '_output', $path . '_pid'));
        $pid = shell_exec("nohup $command > /dev/null 2>&1 & echo $! &");

        file_put_contents($path . '_pid', $pid);

        return $handle;
    }

    /**
     * @param $command
     * @param null $handle
     * @return string
     */
    public function runSymfonyCommandInBackground($command, $handle = null)
    {
        return $this->runInBackground($this->console . ' ' . $command, $handle);
    }

    /**
     * @param $handle
     * @return bool
     */
    public function isRunning($handle)
    {
        $path = $this->getProcessFilename($handle);
        try {
            $result = shell_exec(sprintf("ps %d", $path . '_pid'));
            if (count(preg_split("/\n/", $result)) > 2) {
                return true;
            }
        } catch (Exception $e) {
        }

        $this->clean($handle);

        return false;
    }

    /**
     * @param $handle
     * @return Process
     */
    public function clean($handle)
    {
        $path = $this->getProcessFilename($handle);

        if (file_exists($path . '_pid')) {
            unlink($path . '_pid');
        }

        if (file_exists($path . '_output')) {
            unlink($path . '_output');
        }

        return $this;
    }

    /**
     * @param $handle
     * @return string
     */
    public function getProcessFilename($handle)
    {
        return rtrim($this->tempFolder, '/') . '/' . $handle;
    }
}
