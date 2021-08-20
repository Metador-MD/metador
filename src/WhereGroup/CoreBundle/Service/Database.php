<?php

namespace WhereGroup\CoreBundle\Service;

use Doctrine\Common\Persistence\ObjectRepository;
use Doctrine\DBAL\ConnectionException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;
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
     * @param $entity
     * @return $this
     */
    public function delete($entity)
    {
        $this->em->remove($entity);
        return $this;
    }

    /**
     * @param string $repo
     * @return ObjectRepository
     */
    public function getRepository($repo = 'MetadorCoreBundle:Metadata')
    {
        return $this->em->getRepository($repo);
    }

    /**
     * @return EntityManagerInterface
     */
    public function getEntityManager()
    {
        return $this->em;
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
        return $this;
    }

    /**
     * @return $this
     */
    public function disableSqlLogger()
    {
        $conn = $this->em->getConnection();
        $conn
            ->getWrappedConnection()
            ->setAttribute(\PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);
        $conn->getConfiguration()->setSQLLogger(null);

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

    /**
     * @param MetadataChangeEvent $event
     * @return $this
     */
    public function dispatchPostTruncate(MetadataChangeEvent $event)
    {
        $this->eventDispatcher->dispatch('metadata.post_truncate', $event);
        return $this;
    }

    /**
     * @param $event
     * @return $this
     */
    public function dispatchPreSave(MetadataChangeEvent $event)
    {
        $this->eventDispatcher->dispatch('metadata.pre_save', $event);
        return $this;
    }

    /**
     * @param MetadataChangeEvent $event
     * @return $this
     */
    public function dispatchPostSave(MetadataChangeEvent $event)
    {
        $this->eventDispatcher->dispatch('metadata.post_save', $event);
        return $this;
    }

    /**
     * @param MetadataChangeEvent $event
     * @return $this
     */
    public function dispatchPreDelete(MetadataChangeEvent $event)
    {
        $this->eventDispatcher->dispatch('metadata.pre_delete', $event);
        return $this;
    }

    /**
     * @return $this
     */
    public function beginTransaction()
    {
        $this->em->getConnection()->beginTransaction();
        return $this;
    }

    /**
     * @return $this
     * @throws ConnectionException
     */
    public function transactionCommit()
    {
        $this->em->getConnection()->commit();
        return $this;
    }

    /**
     * @return $this
     * @throws ConnectionException
     */
    public function transactionRollBack()
    {
        $this->em->getConnection()->rollBack();
        $this->em->clear();
        return $this;
    }
}
