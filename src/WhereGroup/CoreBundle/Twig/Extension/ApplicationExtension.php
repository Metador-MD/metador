<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig_Extension;
use Twig_SimpleFunction;
use WhereGroup\CoreBundle\Component\Application;
use WhereGroup\PluginBundle\Component\Plugin;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class ApplicationExtension extends Twig_Extension
{
    private $application;
    private $plugin;
    private $eventDispatcher;
    private $requestStack;

    /**
     * ApplicationExtension constructor.
     * @param Application $application
     * @param Plugin $plugin
     * @param EventDispatcherInterface $eventDispatcher
     * @param RequestStack $requestStack
     */
    public function __construct(
        Application $application,
        Plugin $plugin,
        EventDispatcherInterface $eventDispatcher,
        RequestStack $requestStack
    ) {
        $this->application = $application;
        $this->plugin = $plugin;
        $this->eventDispatcher = $eventDispatcher;
        $this->requestStack = $requestStack;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return [
            new Twig_SimpleFunction('applicationGet', [$this, 'applicationGet']),
            new Twig_SimpleFunction('plugin_is_active', [$this, 'pluginIsActive']),
            new Twig_SimpleFunction('profile_is_active', [$this, 'profileIsActive']),
        ];
    }

    /**
     * @param $type
     * @param null $key
     * @param null $default
     * @param bool $sort
     * @return array|string|null
     */
    public function applicationGet($type, $key = null, $default = null, $sort = false)
    {
        $data = $this->application->getData();

        if (empty($data)) {
            $request = $this->requestStack->getCurrentRequest();
            $this->application->update($request->get('_route'), $request->get('_controller'));
            $this->eventDispatcher->dispatch('application.loading', new ApplicationEvent($this->application, []));
        }

        $data = $this->application->getData($type, $key, $default);

        if ($sort) {
            usort($data,"self::cmp");
        }

        return $data;
    }

    /**
     * @param $a
     * @param $b
     * @return int
     */
    public function cmp($a, $b)
    {
        if ($a["label"] == $b["label"]) {
            return 0;
        }
        return ($a["label"] < $b["label"]) ? -1 : 1;
    }

    /**
     * @param $profileKey
     * @return bool
     */
    public function profileIsActive($profileKey)
    {
        $profiles = $this->plugin->getActiveProfiles();
        return isset($profiles[$profileKey]);
    }

    /**
     * @param $pluginKey
     * @return bool
     */
    public function pluginIsActive($pluginKey)
    {
        $plugins = $this->plugin->getActivePlugins();
        return isset($plugins[$pluginKey]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_application";
    }
}
