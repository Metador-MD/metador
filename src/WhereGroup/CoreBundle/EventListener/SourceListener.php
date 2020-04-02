<?php

namespace WhereGroup\CoreBundle\EventListener;

use WhereGroup\CoreBundle\Event\SourceEvent;
use WhereGroup\CoreBundle\Service\Metadata\Metadata;
use WhereGroup\CoreBundle\Entity\Metadata as MetadataEntity;

/**
 * Class SourceListener
 * @package WhereGroup\CoreBundle\EventListener
 */
class SourceListener
{
    /**
     * @var Metadata
     */
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
        unset($this->metadata);
    }

    /**
     * @param SourceEvent $event
     */
    public function onConfirm(SourceEvent $event)
    {
        $count = $this->metadata->db->getRepository()->countBySource($event->getSlug());

        if ($count > 0) {
            $event->addMessage("Es werden %count% Metadaten gelöscht.", ['%count%' => $count]);
        }
    }

    /**
     * @param SourceEvent $event
     */
    public function onPostDelete(SourceEvent $event)
    {
        $repo = $this->metadata->db->getRepository();

        /** @var MetadataEntity $entity */
        foreach ($repo->findBy(['source' => $event->getSlug()]) as $entity) {
            $this->metadata->delete($entity);
        }
    }
}
