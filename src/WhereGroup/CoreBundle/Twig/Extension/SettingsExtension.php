<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Twig_Extension;
use Twig_SimpleFunction;
use WhereGroup\CoreBundle\Component\Configuration;
use WhereGroup\PluginBundle\Component\Plugin;

/**
 * Class ConfigurationExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class SettingsExtension extends Twig_Extension
{
    /** @var Configuration $configuration */
    protected $configuration;

    /** @var Plugin $plugin */
    protected $plugin;

    /**
     * ConfigurationExtension constructor.
     * @param Plugin $plugin
     * @param Configuration $configuration
     */
    public function __construct(Plugin $plugin, Configuration $configuration)
    {
        $this->plugin = $plugin;
        $this->configuration = $configuration;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return [
            new Twig_SimpleFunction('get_frontend_settings', [$this, 'getFrontendSettings']),
            new Twig_SimpleFunction('get_setting', [$this, 'getSetting']),
        ];
    }

    /**
     * @param $key
     * @param null $filterType
     * @param null $filterValue
     * @param null $default
     * @return mixed
     */
    public function getSetting($key, $filterType = null, $filterValue = null, $default = null)
    {
        return $this->configuration->get($key, $filterType, $filterValue, $default);
    }

    /**
     * @return null
     */
    public function getFrontendSettings()
    {
        $config = [];

        foreach ($this->plugin->getActivePlugins() as $pluginKey => $plugin) {
            if (!isset($plugin['settings']) || empty($plugin['settings'])) {
                continue;
            }

            foreach ($plugin['settings'] as $key => $setting) {
                if (!isset($setting['frontend']) || $setting['frontend'] !== true) {
                    continue;
                }

                /** @var \WhereGroup\CoreBundle\Entity\Configuration $conf */
                $config[$key] = $this->configuration->get(
                    $key,
                    'plugin',
                    $pluginKey,
                    isset($setting['default']) ? $setting['default'] : null
                );
            }
        }

        return $config;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_settings";
    }
}
