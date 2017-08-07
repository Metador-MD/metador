<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use WhereGroup\CoreBundle\Component\Application;
use WhereGroup\PluginBundle\Component\Plugin;

/**
 * Class ApplicationExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class ApplicationExtension extends \Twig_Extension
{
    private $application;
    private $plugin;

    /**
     * ApplicationExtension constructor.
     * @param Application $application
     * @param Plugin $plugin
     */
    public function __construct(Application $application, Plugin $plugin)
    {
        $this->application = $application;
        $this->plugin = $plugin;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('applicationGet', array($this, 'applicationGet')),
            new \Twig_SimpleFunction('plugin_is_active', array($this, 'pluginIsActive')),
            new \Twig_SimpleFunction('profile_is_active', array($this, 'profileIsActive')),
        );
    }

    /**
     * @param $type
     * @param null $key
     * @param null $default
     * @return mixed
     */
    public function applicationGet($type, $key = null, $default = null)
    {
        return $this->application->getData($type, $key, $default);
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
