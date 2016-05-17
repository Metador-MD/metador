<?php

namespace WhereGroup\CoreBundle\Component;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ProfileApplicationMenuListener
 * @package WhereGroup\CoreBundle\Component
 */
abstract class ProfileApplicationMenuListener
{
    protected $metadata;

    /**
     * @param MetadataInterface $metadata
     */
    public function __construct(MetadataInterface $metadata)
    {
        $this->metadata  = $metadata;
    }

    public function __destruct()
    {
        unset($this->metadata);
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app      = $event->getApplication();
        $request  = $app->getRequestStack()->getMasterRequest();
        $id       = null;
        $metadata = null;

        if ($request && $request->get('id', null)) {
            $id       = $request->get('id', null);

            /** @var Metadata $metadata */
            $metadata = $this->metadata->getById($id);
        }

        /***********************************************************************
         * Profile Menu
         ***********************************************************************/
        $app->add(
            $app->get('ProfileMenu')
                ->label($this->name)
                ->path('metadata_index', array(
                    'profile' => $this->pluginId
                ))
        );

        /***********************************************************************
         * Dashboard preview
         ***********************************************************************/
        if ($app->isController('dashboard')) {
            $response = $this->metadata->getMetadata(10, 1, $this->pluginId);

            $app->add(
                $app->get('Dashboard')
                    ->template(
                        'WhereGroupCoreBundle::dashboardPreview.html.twig',
                        array(
                            'title'   => $this->name,
                            'profile' => $this->pluginId,
                            'rows'    => $response['result']
                        )
                    )
            );

            unset($response);
        }

        if ($app->isBundle($this->bundle)) {
        /***********************************************************************
         * Profile Name
         ***********************************************************************/
            $app->add(
                $app->get('Profile')
                    ->name($this->name)
                    ->active($app->isController('Profile'))
            );

        /***********************************************************************
         * Plugin menu
         ***********************************************************************/
            if ($app->isAction('index')) {
                $app->add(
                    $app->get('PluginMenu', 'new')
                        ->label('neu')
                        ->icon('icon-plus')
                        ->path('metadata_new', array('profile' => $this->pluginId))
                        ->active($app->isAction(array('new', 'use')))
                );
            } else {
                $data = array();

                if ($app->isAction('new') || $app->isAction('edit')) {
                    $data['confirm-abort'] = "Nicht gespeicherte Daten gehen verloren.";
                }

                $app->add(
                    $app->get('PluginMenu', 'index')
                        ->label('zurück')
                        ->icon('icon-redo2')
                        ->path('metadata_index', array('profile' => $this->pluginId))
                        ->active($app->isAction(array('new', 'use')))
                        ->data($data)
                );
            }

            if ($app->isAction('edit') && !is_null($id)) {
                $app->add(
                    $app->get('PluginMenu', 'xml')
                        ->label('XML')
                        ->icon('icon-download')
                        ->path('metador_export_xml', array('id' => $id))
                        ->target('_BLANK')
                )->add(
                    $app->get('PluginMenu', 'pdf')
                        ->label('PDF')
                        ->icon('icon-file-pdf')
                        ->path('metador_export_pdf', array('id' => $id))
                )->add(
                    $app->get('PluginMenu', 'html')
                        ->label('HTML')
                        ->icon('icon-embed2')
                        ->path('metador_export_html', array('id' => $id))
                );

                if (!is_null($id) && !$metadata->getReadonly()) {
                    $app->add(
                        $app->get('PluginMenu', 'confirm')
                            ->label('löschen')
                            ->icon('icon-bin2')
                            ->path('metadata_confirm', array('profile' => $this->pluginId, 'id' => $id))
                    );
                }
            }

            if ($app->isAction('new') || ($app->isAction('edit') && !is_null($id) && !$metadata->getReadonly())) {
                $app->add(
                    $app->get('PluginMenu', 'save')
                        ->label('speichern')
                        ->icon('icon-floppy-disk')
                );
            }
        }
    }
}
