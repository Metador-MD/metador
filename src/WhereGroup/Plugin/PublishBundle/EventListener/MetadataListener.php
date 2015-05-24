<?php

namespace WhereGroup\Plugin\PublishBundle\EventListener;

use Symfony\Bundle\TwigBundle\Debug\TimedTwigEngine;
use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;

/**
 * Class MetadataListener
 * @package WhereGroup\Plugin\PublishBundle\EventListener
 * @author A.R.Pour
 */
class MetadataListener
{
    private $exportPath = null;

    /** @var TimedTwigEngine $templating */
    private $templating;

    /**
     * @param $exportPath
     * @param $templating
     */
    public function __construct($exportPath, $templating)
    {
        $this->exportPath = rtrim($exportPath, '/') . '/';
        $this->templating = $templating;
    }

    public function __destruct()
    {
        unset($this->templating);
    }

    /**
     * Stores the metadata xml to the filesystem.
     * @param  MetadataChangeEvent $event
     */
    public function onPostSave(MetadataChangeEvent $event)
    {
        /** @var Metadata $metadata */
        $metadata = $event->getDataset();
        $filepath = $this->getFilename($metadata->getUuid());
        $profile  = ucfirst(strtolower($metadata->getProfile()));

        if (!is_writeable($this->exportPath)) {
            throw new \RuntimeException("Publish folder not writeable.");
        }

        // remove if exists
        if ($metadata->getPublic() === false && file_exists($filepath)) {
            unlink($filepath);

        // create xml
        } else {
            $xml = $this->templating->render("Profile" . $profile . "Bundle:Export:metadata.xml.twig", array(
                "p" => $metadata->getObject()
            ));

            file_put_contents($filepath, $xml);
        }
    }

    /**
     * Removes the metadata xml from the filesystem.
     * @param  MetadataChangeEvent $event
     */
    public function onDelete(MetadataChangeEvent $event)
    {
        /** @var Metadata $metadata */
        $metadata = $event->getDataset();
        $filepath = $this->getFilename($metadata->getUuid());

        if (is_writeable($this->exportPath) && file_exists($filepath)) {
            unlink($filepath);
        }
    }

    /**
     * @param $uuid
     * @return string
     */
    private function getFilename($uuid)
    {
        return $this->exportPath . md5($uuid) . '.xml';
    }
}
