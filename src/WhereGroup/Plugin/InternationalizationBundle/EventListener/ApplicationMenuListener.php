<?php

namespace WhereGroup\Plugin\InternationalizationBundle\EventListener;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

class ApplicationMenuListener
{
    /** @var Request */
    private $request;

    /** @var KernelInterface  */
    private $kernel;

    /**
     * @param KernelInterface $kernel
     */
    public function __construct(KernelInterface $kernel)
    {
        $this->kernel = $kernel;

        if ($this->kernel->getContainer()->has('request')) {
            $this->request = $this->kernel->getContainer()->get('request');
        } else {
            $this->request = Request::createFromGlobals();
        }
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $app->prepend('app-global-menu', 'locale', array(
            'template' => "WhereGroupInternationalizationBundle::menu.html.twig",
            'params'   => array(
                'locale' => $this->request->getLocale()
            )
        ));
    }
}
