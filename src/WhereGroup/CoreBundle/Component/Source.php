<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\ORM\EntityManagerInterface;
use WhereGroup\CoreBundle\Entity\Source as SourceEntity;

/**
 * Class Source
 * @package WhereGroup\CoreBundle\Component
 */
class Source implements SourceInterface
{
    /** @var \Doctrine\Common\Persistence\ObjectRepository|null|\WhereGroup\CoreBundle\Entity\SourceRepository  */
    protected $repo = null;

    const ENTITY = "MetadorCoreBundle:Source";

    /** @param EntityManagerInterface $em */
    public function __construct(EntityManagerInterface $em)
    {
        $this->repo = $em->getRepository(self::ENTITY);
    }

    public function __destruct()
    {
        unset(
            $this->repo
        );
    }

    /**
     * @return mixed
     */
    public function count()
    {
        return (int)$this->repo->count();
    }

    /**
     * @param $id
     */
    public function get($id)
    {
        $this->allValues();

        return $this->repo->findOneById($id);
    }

    /**
     * @return array|\WhereGroup\CoreBundle\Entity\Source[]
     */
    public function all()
    {
        return $this->repo->findAll();
    }

    /**
     * @return array
     */
    public function allValues()
    {
        $array = array();

        foreach ($this->all() as $source) {
            $array[$source->getSlug()] = $source->getName();
        }

        return $array;
    }

    /**
     * @param $slug
     * @return mixed
     */
    public function findBySlug($slug)
    {
        return $this->repo->findOneBySlug($slug);
    }

    /**
     * @param $entity
     * @return $this
     */
    public function save($entity)
    {
        $this->repo->save($entity);

        return $this;
    }

    /**
     * @param $slug
     * @param $name
     * @param string $description
     * @param bool $system
     */
    public function set($slug, $name, $description = '', $system = false)
    {
        $entity = new SourceEntity();
        $entity
            ->setSlug($slug)
            ->setName($name)
            ->setDescription($description)
            ->setSystem($system);
        $this->save($entity);
    }

    /**
     * @param $entity
     * @return $this
     */
    public function remove($entity)
    {
        $this->repo->remove($entity);

        return $this;
    }
}
