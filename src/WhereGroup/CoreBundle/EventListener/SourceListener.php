<?php

namespace WhereGroup\CoreBundle\EventListener;

use Doctrine\ORM\EntityManagerInterface;
use WhereGroup\CoreBundle\Event\SourceEvent;

/**
 * Class ApplicationListener
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

    public function onConfirm(SourceEvent $event)
    {
        $event->addMessage("Alle in der Datenquelle vorhandenen Metadaten gehen verloren.");
    }

    public function onPostDelete(SourceEvent $event)
    {

    }
}
