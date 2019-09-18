<?php

namespace WhereGroup\CoreBundle\Component\Utils;

use Exception;

/**
 * Class Process
 * @package WhereGroup\CoreBundle\Component\Utils
 */
class Process
{
    private $folder;

    /**
     * Process constructor.
     * @param $folder
     */
    public function __construct($folder)
    {
        $this->folder = $folder;
    }

    /**
     * @param $command
     * @param null $handle
     * @return string
     */
    public function run($command, $handle = null)
    {
        if (is_null($handle)) {
            $handle = md5(microtime(true));
        }
        $path = rtrim($this->folder, '/') . '/' . $handle;

        exec(sprintf("%s > %s 2>&1 & echo $! > %s", $command, $path . '_output', $path . '_pid'));

        return $handle;
    }

    /**
     * @param $handle
     * @return bool
     */
    public function isRunning($handle)
    {
        $path = rtrim($this->folder, '/') . '/' . $handle;
        try {
            $result = shell_exec(sprintf("ps %d", $path . '_pid'));
            if (count(preg_split("/\n/", $result)) > 2) {
                return true;
            }
        } catch (Exception $e) {
        }

        return false;
    }
}
