<?php

namespace WhereGroup\CoreBundle\Component\Utils;

/**
 * Class Debug
 * @package WhereGroup\CoreBundle\Component\Utils
 */
class Debug
{
    private static $filename = "/tmp/debug.log";

    /**
     * @param $message
     * @param string $prepend
     */
    public static function append($message, $prepend = "\n")
    {
        if (is_array($message) || is_object($message)) {
            $message = print_r($message, 1);
        }

        file_put_contents(self::$filename, $prepend . $message, FILE_APPEND);
    }

    /**
     *
     */
    public static function clear()
    {
        file_put_contents(self::$filename, "");
    }
}
