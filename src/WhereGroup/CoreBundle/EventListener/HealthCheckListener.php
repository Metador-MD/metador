<?php

namespace WhereGroup\CoreBundle\EventListener;

use WhereGroup\CoreBundle\Component\Configuration;
use WhereGroup\CoreBundle\Entity\Log;
use WhereGroup\CoreBundle\Event\HealthCheckEvent;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityManager;

/**
 * Class HealthCheckListener
 * @package WhereGroup\CoreBundle\EventListener
 */
class HealthCheckListener extends BasicHealthcheckListener
{
    private $em;
    private $driver;
    private $host;
    private $port;
    private $name;
    private $user;
    private $password;
    private $path;
    private $configuration;

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
     * @param Configuration $configuration
     */
    public function __construct(
        Configuration $configuration,
        EntityManagerInterface $em,
        $driver = null,
        $host = null,
        $port = null,
        $name = null,
        $user = null,
        $password = null,
        $path = null
    ) {
        $this->configuration = $configuration;
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
     * @throws \Doctrine\ORM\ORMException
     * @throws \Exception
     */
    public function onCheck(HealthCheckEvent $healthCheck)
    {
        $this->healthCheck = $healthCheck;
        $this->add($this->databaseConnection(), 'healthcheck_database_connection_error');


        $hierarchyLevel = $this->configuration->get('hierarchy_levels', 'plugin', 'metador_core');

        if (!empty($hierarchyLevel)) {
            $this->add(Log::SUCCESS, 'healthcheck_hierarchy_level_support_success', [
                '%hierarchyLevel%' => implode(', ', $hierarchyLevel)
            ]);
        } else {
            $this->add(Log::INFO, 'healthcheck_hierarchy_level_support_error');
        }
    }

    /**
     * @return string
     * @throws \Doctrine\ORM\ORMException
     */
    private function databaseConnection() : string
    {
        /** @var EntityManagerInterface $manager */
        $manager = EntityManager::create(
            [
                'driver'   => $this->driver,
                'user'     => $this->user,
                'host'     => $this->host,
                'password' => $this->password,
                'dbname'   => $this->name,
                'path'     => $this->path,
                'port'     => $this->port
            ],
            $this->em->getConfiguration(),
            $this->em->getEventManager()
        );

        try {
            $manager->getConnection()->connect();
            return Log::SUCCESS;
        } catch (\Exception $e) {
            return Log::ERROR;
        }
    }
}
