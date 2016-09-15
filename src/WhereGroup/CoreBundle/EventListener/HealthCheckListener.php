<?php

namespace WhereGroup\CoreBundle\EventListener;

use WhereGroup\CoreBundle\Event\HealthCheckEvent;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityManager;

/**
 * Class HealthCheckListener
 * @package WhereGroup\CoreBundle\EventListener
 */
class HealthCheckListener
{
    protected $em       = null;
    protected $driver   = null;
    protected $host     = null;
    protected $port     = null;
    protected $name     = null;
    protected $user     = null;
    protected $password = null;
    protected $path     = null;

    /**
     * HealthCheckListener constructor.
     * @param EntityManagerInterface $em
     * @param null $driver
     * @param null $host
     * @param null $port
     * @param null $name
     * @param null $user
     * @param null $password
     * @param null $path
     */
    public function __construct(
        EntityManagerInterface $em,
        $driver = null,
        $host = null,
        $port = null,
        $name = null,
        $user = null,
        $password = null,
        $path = null
    ) {
        $this->em       = $em;
        $this->driver   = $driver;
        $this->host     = $host;
        $this->port     = $port;
        $this->name     = $name;
        $this->user     = $user;
        $this->password = $password;
        $this->path     = $path;
    }

    /**
     * @param HealthCheckEvent $healthCheck
     */
    public function onCheck(HealthCheckEvent $healthCheck)
    {
        /** @var EntityManagerInterface $manager */
        $manager = EntityManager::create(
            array(
                'driver'   => $this->driver,
                'user'     => $this->user,
                'host'     => $this->host,
                'password' => $this->password,
                'dbname'   => $this->name,
                'path'     => $this->path,
                'port'     => $this->port
            ),
            $this->em->getConfiguration(),
            $this->em->getEventManager()
        );

        try {
            $manager->getConnection()->connect();
        } catch (\Exception $e) {
            $healthCheck->addWarning('Core', 'healthcheck_database_connection_error');
        }
    }
}
