<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\ORM\EntityManagerInterface;
use WhereGroup\CoreBundle\Entity\Configuration as ConfigurationEntity;

/**
 * Class Configuration
 * @package WhereGroup\CoreBundle\Component
 */
class Configuration
{
    /** @var EntityManagerInterface $em */
    protected $em;

    const ENTITY = "MetadorCoreBundle:Configuration";

    /** @param EntityManagerInterface $em */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function __destruct()
    {
        unset(
            $this->em
        );
    }

    /**
     * @param $key
     * @param $value
     * @param null $filterType
     * @param null $filterValue
     */
    public function set($key, $value, $filterType = null, $filterValue = null)
    {
        $this->em->getRepository(self::ENTITY)->set($key, $value, $filterType, $filterValue);
    }

    /**
     * @param $key
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function get($key, $filterType = null, $filterValue = null)
    {
        return $this->em->getRepository(self::ENTITY)->get($key, $filterType, $filterValue);
    }

    /**
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function findAll($filterType = null, $filterValue = null)
    {
        return $this->em->getRepository(self::ENTITY)->all($filterType, $filterValue);
    }
}
