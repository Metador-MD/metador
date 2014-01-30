<?php

namespace WhereGroup\ExportBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\MetadorBundle\Event\MetadataChangeEvent;


class MetadorListener
{
    protected $container;

    public function __construct(ContainerInterface $container) {
        $this->container = $container;

    }

    public function onPreSave(MetadataChangeEvent $event)
    {

    }

    /**
     * Stores the metadata xml to the filesystem.
     * @param  MetadataChangeEvent $event
     */
    public function onPostSave(MetadataChangeEvent $event)
    {
        $metadata = $event->getDataset();
        $config = $event->getConfig();
        $filename = rtrim($config['export']['path'], '/');

        if($this->testPath($config['export']['path'])) {
        
            $templating = $this->container->get('templating');          
            $conf = $this->container->getParameter('metador');

            if($metadata->getHierarchyLevel() == 'service') {
                $template = $conf['templates']['form'] . ':Service:service.xml.twig';
            } else {
                $template = $conf['templates']['form'] . ':Dataset:dataset.xml.twig';
            }

            $filename .= '/' . md5($metadata->getUuid()) . '.xml';

            if($metadata->getPublic() == 0) {
                if(file_exists($filename)) {
                    unlink($filename);
                }
            } else {
                $xml = $templating->render($template, array(
                    'p' => $metadata->getObject()
                ));

                file_put_contents($filename, $xml);
            }
        }
    }

    /**
     * Removes the metadata xml from the filesystem.
     * @param  MetadataChangeEvent $event
     */
    public function onDelete(MetadataChangeEvent $event)
    {
        $metadata = $event->getDataset();
        $config = $event->getConfig();
        $filename = rtrim($config['export']['path'], '/');

        if($this->testPath($config['export']['path'])) {
            $filename .= '/' . md5($metadata->getUuid()) . '.xml';

            if(file_exists($filename)) {
                unlink($filename);
            }
        }

    }

    private function testPath($path) {
        if(is_dir($path) && is_writable($path)) {
            return true;
        }

        return false;
    }
}
