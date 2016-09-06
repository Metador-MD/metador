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

        if (is_null($request) || is_null($request->get('id', null))) {
            $request  = $app->getRequestStack()->getCurrentRequest();
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
                        'MetadorCoreBundle::dashboardPreview.html.twig',
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
                )->add(
                    $app->get('SearchMenu', 'pdf')
                        ->label('PDF')
                        ->icon('icon-file-pdf')
                        ->path('metador_export_pdf')
                        ->target('_BLANK')
                )->add(
                    $app->get('SearchMenu', 'xml')
                        ->label('XML')
                        ->icon('icon-download')
                        ->path('metador_export_xml')
                        ->target('_BLANK')
                )->add(
                    $app->get('SearchMenu', 'html')
                        ->label('HTML')
                        ->icon('icon-embed2')
                        ->path('metador_export_html')
                        ->target('_BLANK')
                );

                if ($app->isEnv('dev')) {
                    $app->add(
                        $app->get('SearchMenu', 'obj')
                            ->label('Objekt')
                            ->icon('icon-embed')
                            ->path('metador_export_obj')
                            ->target('_BLANK')
                    );
                }

            } else {
                $data = array();

                if ($app->isAction(array('new', 'edit'))) {
                    $data['confirm-abort'] = "Nicht gespeicherte Daten gehen verloren.";
                }

                if ($app->isAction('edit')) {
                    $app->add(
                        $app->get('PluginMenu', 'template')
                            ->label('als Vorlage verwenden')
                            ->icon('icon-files-empty')
                            ->path('metadata_use', array(
                                'profile' => $this->pluginId,
                                'id' => $request->get('id', null))
                            )
                            ->active($app->isAction(array('new', 'use')))
                            ->data($data)
                    );
                }

                $app->add(
                    $app->get('PluginMenu', 'index')
                        ->label('Übersicht')
                        ->icon('icon-redo2')
                        ->path('metadata_index', array('profile' => $this->pluginId))
                        ->active($app->isAction(array('new', 'use')))
                        ->data($data)
                );
            }
        }
    }
}
