<?php

namespace WhereGroup\CoreBundle\EventListener;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NonUniqueResultException;
use WhereGroup\CoreBundle\Event\SourceEvent;

/**
 * Class SourceListener
 * @package WhereGroup\CoreBundle\EventListener
 */
class SourceListener
{
    /** @var \Doctrine\Common\Persistence\ObjectRepository|null|\WhereGroup\CoreBundle\Entity\SourceRepository  */
    protected $repo = null;

    const ENTITY = "MetadorCoreBundle:Metadata";

    /** @param EntityManagerInterface $em */
    public function __construct(EntityManagerInterface $em)
    {
        $this->repo = $em->getRepository(self::ENTITY);
    }

    public function __destruct()
    {
        unset($this->repo);
    }

    /**
     * @param SourceEvent $event
     * @throws NonUniqueResultException
     */
    public function onConfirm(SourceEvent $event)
    {
        $count = $this->repo->countBySource($event->getSlug());

        if ($count > 0) {
            $event->addMessage("Es werden %count% Metadaten gelöscht.", ['%count%' => $count]);
        }
    }

    /**
     * @param SourceEvent $event
     */
    public function onPostDelete(SourceEvent $event)
    {
        $this->repo->deleteBySource($event->getSlug());
    }
}
