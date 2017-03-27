<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use WhereGroup\CoreBundle\Component\Application;

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
        return array(
            new \Twig_SimpleFunction('session_maxlifetime', array($this, 'maxlifetime'))
        );
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'session_extension';
    }

    /**
     * @return string
     */
    public function maxlifetime()
    {
        return ini_get("session.gc_maxlifetime");
    }
}
