<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

/**
 * Class SessionExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class SessionExtension extends \Twig_Extension
{
    /**
     * @return array
     */
    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('session_maxlifetime', [$this, 'maxlifetime'])
        ];
    }

    /**
     * @return string
     */
    public function maxlifetime()
    {
        return ini_get("session.gc_maxlifetime");
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_session";
    }
}
