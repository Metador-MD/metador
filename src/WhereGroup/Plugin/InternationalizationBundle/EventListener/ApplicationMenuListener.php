<?php

namespace WhereGroup\Plugin\InternationalizationBundle\EventListener;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\KernelInterface;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\PluginBundle\Component\ApplicationIntegration;

class ApplicationMenuListener extends ApplicationIntegration
{
    protected $app    = null;
    protected $prefix = 'locale';

    /** @var RequestStack */
    private $requestStack;

    /** @var KernelInterface  */
    private $kernel;

    /**
     * @param KernelInterface $kernel
     */
    public function __construct(KernelInterface $kernel, RequestStack $requestStack)
    {
        $this->kernel       = $kernel;
        $this->requestStack = $requestStack;
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        if (!is_object($this->requestStack->getCurrentRequest())) {
            return false;
        }
        
        $this->app = $event->getApplication();

        $this->app->prepend('app-global-menu', 'locale', array(
            'template' => "WhereGroupInternationalizationBundle::menu.html.twig",
            'params'   => array(
                'locale' => $this->requestStack->getCurrentRequest()->getLocale()
            )
        ));

        if ($this->app->isBundle('internationalization')) {
            $this->addToScripts('bundles/wheregroupinternationalization/locale.js');
        }

        if ($this->app->routeStartsWith('metador_admin') && $this->kernel->getEnvironment() === 'dev') {
            $this->app->add('app-admin-menu', 'locale', array(
                'icon'   => 'icon-flag',
                'label'  => 'Sprachen',
                'path'   => 'metador_admin_locale_edit',
                'params' => array()
            ), 'ROLE_SUPERUSER');
        }
    }
}
