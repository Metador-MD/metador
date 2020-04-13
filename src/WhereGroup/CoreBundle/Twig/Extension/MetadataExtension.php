<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use DateTime;
use Twig_Extension;
use Twig_SimpleFunction;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;
use WhereGroup\UserBundle\Component\UserInterface;

/**
 * Class MetadataExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class MetadataExtension extends Twig_Extension
{
    /** @var UserInterface  */
    private $user;

    public function __construct(UserInterface $user)
    {
        $this->user = $user;
    }

    public function __destruct()
    {
        unset($this->user);
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return [
            new Twig_SimpleFunction('metadata_is_locked', [$this, 'isLocked']),
        ];
    }

    /**
     * @param $p
     * @return bool
     * @throws MetadorException
     */
    public function isLocked($p)
    {
        if ((boolean)$p['_locked'] === false) {
            return false;
        }

        if (!isset($p['_lock_user']) || !isset($p['_lock_time'])) {
            throw new MetadorException('_lock_user and _lock_time are missing in Dataobject!');
        }

        $dateTime = new DateTime();
        $timeout = ($dateTime->getTimestamp() - $p['_lock_time']) > (int)ini_get("session.gc_maxlifetime");

        if ($timeout || $p['_lock_user'] === $this->user->getUsernameFromSession()) {
            return false;
        }

        return true;
    }
}
