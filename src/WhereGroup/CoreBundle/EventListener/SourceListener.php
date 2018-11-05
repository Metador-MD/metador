<?php

namespace WhereGroup\CoreBundle\EventListener;

use WhereGroup\CoreBundle\Component\Metadata;
use WhereGroup\CoreBundle\Event\SourceEvent;

/**
 * Class SourceListener
 * @package WhereGroup\CoreBundle\EventListener
 */
class SourceListener
{
    protected $metadata;

    /**
     * SourceListener constructor.
     * @param Metadata $metadata
     */
    public function __construct(Metadata $metadata)
    {
        $this->metadata = $metadata;
    }

    public function __destruct()
    {
        unset($this->repo);
    }

    /**
     * @param SourceEvent $event
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function onConfirm(SourceEvent $event)
    {
        $repo = $this->metadata->getRepository();
        $count = $repo->countBySource($event->getSlug());

        if ($count > 0) {
            $event->addMessage("Es werden %count% Metadaten gelöscht.", ['%count%' => $count]);
        }
    }

    /**
     * @param SourceEvent $event
     * @throws \WhereGroup\CoreBundle\Component\Exceptions\MetadataException
     */
    public function onPostDelete(SourceEvent $event)
    {
        $repo = $this->metadata->getRepository();

        foreach ($repo->findBy(['source' => $event->getSlug()]) as $entity) {
            $this->metadata->deleteById($entity->getId());
        }
    }
}
