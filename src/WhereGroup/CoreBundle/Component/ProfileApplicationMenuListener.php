<?php

namespace WhereGroup\CoreBundle\Component;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\Finder;

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
        $app       = $event->getApplication();
        $request   = $app->getRequestStack()->getMasterRequest();
        $isProfile = (
            $app->isBundle('core')
            && $app->isController('profile')
            && $request->attributes->get('profile') === $this->pluginId
        );

        if (is_null($request) || is_null($request->get('id', null))) {
            $request  = $app->getRequestStack()->getCurrentRequest();
        }

        if ($isProfile) {
            /***********************************************************************
             * Profile Name
             ***********************************************************************/
            $app->add(
                $app->get('Profile')
                    ->name($this->name)
                    ->active($app->isController('profile'))
            );
        }

        /***********************************************************************
         * Profile Menu
         ***********************************************************************/
        $app->add(
            $app->get('ProfileMenu')
                ->label($this->name)
                ->path('metadata_index', array(
                    'profile' => $this->pluginId
                ))->setRole('ROLE_SYSTEM_USER')
        );

        /***********************************************************************
         * Dashboard preview
         ***********************************************************************/
        if ($app->isController('dashboard')) {
            $filter = new Finder();
            $filter->page = 1;
            $filter->hits = 10;
            $filter->profile = $this->pluginId;
            $response = $this->metadata->find($filter);

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

        /***********************************************************************
         * Plugin menu
         ***********************************************************************/

        if ($isProfile && $app->isAction('index')) {
            $app->add(
                $app->get('PluginMenu', 'new')
                    ->label('neu')
                    ->icon('icon-plus')
                    ->path('metadata_new', array('profile' => $this->pluginId))
                    ->active($app->isAction(array('new', 'use')))
            );
        }

        if (($isProfile && $app->isAction('index')) || $app->isRoute('metador_home')) {
            $app->add(
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
            )->add(
                $app->get('SearchMenu', 'json')
                    ->label('{JSON}')
                    ->path('metador_export_json')
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
        } elseif ($isProfile) {
            $data = array();

            if ($app->isAction(array('new', 'edit'))) {
                $data['confirm-abort'] = "Nicht gespeicherte Daten gehen verloren.";
            }

            if ($app->isAction(array('edit', 'update'))) {
                $app->add(
                    $app->get('PluginMenu', 'template')
                        ->label('als Vorlage verwenden')
                        ->icon('icon-files-empty')
                        ->path(
                            'metadata_use',
                            array(
                                'profile' => $this->pluginId,
                                'id' => $request->get('id', null)
                            )
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
