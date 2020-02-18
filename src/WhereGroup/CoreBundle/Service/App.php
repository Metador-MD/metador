<?php

namespace WhereGroup\CoreBundle\Service;

use Exception;
use Ramsey\Uuid\Uuid;
use WhereGroup\UserBundle\Component\UserInterface;
use WhereGroup\UserBundle\Entity\User;

/**
 * Class App
 * @package WhereGroup\CoreBundle\Service
 */
class App
{
    /** @var UserInterface  */
    protected $user;

    /**
     * App constructor.
     * @param UserInterface $user
     */
    public function __construct(UserInterface $user)
    {
        $this->user = $user;
    }

    public function __destruct()
    {
        unset($this->user);
    }

    /**
     * @param $username
     * @return User|null
     */
    public function getUser($username)
    {
        return is_null($username)
            ? $this->user->getUserFromSession()
            : $this->user->getByUsername($username);
    }

    /**
     * @return string
     * @throws Exception
     */
    public function generateUuid(): string
    {
        return (Uuid::uuid4())->toString();
    }
}
