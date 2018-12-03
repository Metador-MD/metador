<?php

namespace WhereGroup\CoreBundle\Component\Utils;

/**
 * Class Password
 * @package WhereGroup\CoreBundle\Component\Utils
 */
class Password
{
    private static $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    /**
     * @param int $length
     * @return string
     */
    public static function generate($length = 20)
    {
        $password = "";
        srand((double)microtime()*1000000);

        for ($i=0; $i<$length; $i++) {
            $password .= substr(self::$chars, rand() % strlen(self::$chars), 1);
        }

        return $password;
    }
}
