<?php

namespace WhereGroup\Plugin\AddressBundle\EventListener;

use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;
use WhereGroup\Plugin\AddressBundle\Component\AddressInterface;

/**
 * Class MetadataListener
 * @package WhereGroup\Plugin\AddressBundle\EventListener
 * @author A.R.Pour
 */
class MetadataListener
{
    protected $address = null;

    /**
     * @param AddressInterface $address
     */
    public function __construct(AddressInterface $address)
    {
        $this->address = $address;
    }

    /**
     *
     */
    public function __destruct()
    {
        unset($this->address);
    }

    /**
     * @param MetadataChangeEvent $event
     */
    public function onPostSave(MetadataChangeEvent $event)
    {
        /** @var Metadata $metadata */
        $metadata = $event->getDataset();

        $this->address->set($metadata->getObject());
    }
}
