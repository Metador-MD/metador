<?php


namespace WhereGroup\CoreBundle\Service;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use WhereGroup\CoreBundle\Event\MetadataFlushEvent;

/**
 * Class Database
 * @package WhereGroup\CoreBundle\Service
 */
class Database
{
    /** @var EntityManagerInterface */
    protected $em;

    /** @var EventDispatcherInterface */
    protected $eventDispatcher;

    /**
     * Database constructor.
     * @param EntityManagerInterface $em
     * @param EventDispatcherInterface $eventDispatcher
     */
    public function __construct(EntityManagerInterface $em, EventDispatcherInterface $eventDispatcher)
    {
        $this->em = $em;
        $this->eventDispatcher = $eventDispatcher;
    }

    public function __destruct()
    {
        unset($this->em, $this->eventDispatcher);
    }

    /**
     * @param $entity
     * @return $this
     */
    public function persist($entity)
    {
        $this->em->persist($entity);
        return $this;
    }

    /**
     * @return $this
     */
    public function clearSqlObjectManager()
    {
        $this->em->clear();
        return $this;
    }

    /**
     * @return $this
     */
    public function flush()
    {
        $this->em->flush();
        return $this->clearSqlObjectManager();
    }

    /**
     * @return $this
     */
    public function disableSqlLogger()
    {
        $this->em->getConnection()->getConfiguration()->setSQLLogger(null);
        return $this;
    }

    /**
     * @return $this
     */
    public function dispatchFlush()
    {
        $this->eventDispatcher->dispatch('metadata.flush', new MetadataFlushEvent());
        return $this;
    }
}
