<?php

namespace WhereGroup\CoreBundle\Component;


use Doctrine\ORM\EntityManagerInterface;

class ConfigurationManager
{
    /** @var EntityManagerInterface $em */
    protected $em;

    /**
     * @var string $repository
     */
    private $repository = "MetadorCoreBundle:Configuration";

    /**
     * @param EntityManagerInterface $em
     */
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
        //->set($key, $value, $filterType, $filterValue);
    }

    /**
     * @param $key
     * @param null $filterType
     * @param null $filterValue
     */
    public function get($key, $filterType = null, $filterValue = null)
    {
        //return $this->em->getRepository($this->repository)->get($key, $filterType, $filterValue);
    }

}
