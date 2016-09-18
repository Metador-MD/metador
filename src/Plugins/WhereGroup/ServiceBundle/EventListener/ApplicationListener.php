<?php

namespace Plugins\WhereGroup\ServiceBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\ProfileApplicationMenuListener;
use WhereGroup\PluginBundle\Component\Plugin;
use WhereGroup\CoreBundle\Component\MetadataInterface;

/**
 * Class ApplicationListener
 * @package Plugins\WhereGroup\ServiceBundle\EventListener
 */
class ApplicationListener extends ProfileApplicationMenuListener
{
    protected $pluginId = 'profile-service';
    protected $name     = 'Dienste';
    protected $metadata = null;
    protected $plugin   = null;

    /**
     * ApplicationListener constructor.
     * @param MetadataInterface $metadata
     * @param Plugin $plugin
     */
    public function __construct(
        MetadataInterface $metadata,
        Plugin $plugin
    ) {
        parent::__construct($metadata);

        $this->metadata = $metadata;
        $this->plugin   = $plugin;
    }

    public function __destruct()
    {
        unset(
            $this->metadata,
            $this->plugin
        );
    }

    /**
     * @param ApplicationEvent $event
     * @throws \Exception
     */
    public function onLoading(ApplicationEvent $event)
    {
        parent::onLoading($event);

        $app = $event->getApplication();

        if ($app->isBundle($this->bundle) && $app->isAction('edit')) {
            $plugins = $this->plugin->getPlugin('metador-map');
            $id      = $app->getRequestStack()->getMasterRequest()->get('id', null);

            // If map plugin is active
            if (!is_null($plugins) && $plugins['active'] === true && !is_null($id)) {
                /** @var Metadata $metadata */
                $metadata = $this->metadata->getById($id);
                $p = $metadata->getObject();

                if ($p['serviceType'] === 'view'
                    && isset($p['containsOperationsURL'])
                    && $p['containsOperationsURL'] !== '') {

                    $app->add(
                        $app->get('PluginMenu', 'map')
                            ->template('ProfileServiceBundle:Export:loadMap.html.twig', array(
                                'url' => trim($p['containsOperationsURL'])
                            ))
                    );
                }
            }
        }
    }
}
