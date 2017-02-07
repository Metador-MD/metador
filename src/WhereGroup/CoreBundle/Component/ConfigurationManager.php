<?php

namespace WhereGroup\CoreBundle\Component;


use Doctrine\ORM\EntityManagerInterface;
use WhereGroup\CoreBundle\Entity\Configuration;

class ConfigurationManager
{
    /** @var EntityManagerInterface $em */
    protected $em;

    /** @var string $repository */
    private $repository = "MetadorCoreBundle:Configuration";

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
        $this->em->getRepository($this->repository)->set($key, $value, $filterType, $filterValue);
    }

    /**
     * @param $key
     * @param null $filterType
     * @param null $filterValue
     */
    public function get($key, $filterType = null, $filterValue = null)
    {
        return $this->em->getRepository($this->repository)->get($key, $filterType, $filterValue);
    }

    /**
     * @param Configuration $configuration
     * @throws \Exception
     */
    public function createConfig(Configuration $configuration)
    {

        if($configuration) {
            $this->em->beginTransaction();

            try{
                $this->em->persist($configuration);
                $this->em->flush();
                $this->em->commit();
            }
            catch(\Exception $e){
                $this->em->rollback();
                throw $e;
            }
        }
    }

    /**
     * @param null $filterType
     * @param null $filterValue
     * @return mixed
     */
    public function findAllByPluginName($filterType = null, $filterValue = null)
    {
        return $this->em->getRepository($this->repository)->all($filterType, $filterValue);
    }

}
