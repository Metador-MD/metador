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
        // Todo: add env to command
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
        shell_exec(sprintf("%s > %s 2>&1 & echo $! > %s &", $command, $path . '_output', $path . '_pid'));

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
            $result = shell_exec(sprintf("ps %d", file_get_contents($path . '_pid')));

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

    /**
     * @param $response
     */
    public function sendResponse($response)
    {
        ob_end_clean();
        header("Connection: close\r\n");
        header("Content-Encoding: none\r\n");
        ignore_user_abort(true);
        //fastcgi_finish_request();
        ob_start();
        echo $response;
        header("Content-Length: " . ob_get_length());
        ob_end_flush();
        flush();

        if (ob_get_contents()) {
            ob_end_clean();
        }
    }

    /**
     * @param $array
     */
    public function sendJsonResponse($array)
    {
        ob_end_clean();
        header("Connection: close\r\n");
        header("Content-Type: application/json\r\n");
        header("Content-Encoding: none\r\n");
        ignore_user_abort(true);
        //fastcgi_finish_request();
        ob_start();
        echo json_encode($array);
        header("Content-Length: " . ob_get_length());
        ob_end_flush();
        flush();

        if (ob_get_contents()) {
            ob_end_clean();
        }
    }

    /**
     * @param $url
     */
    public function redirectResponse($url)
    {
        ob_end_clean();
        header("Connection: close\r\n");
        header("Content-Encoding: none\r\n");
        header("Location: " . $url . "\r\n");
        ignore_user_abort(true);
        ob_start();
        header("Content-Length: " . ob_get_length());
        ob_end_flush();
        flush();

        if (ob_get_contents()) {
            ob_end_clean();
        }
    }
}
