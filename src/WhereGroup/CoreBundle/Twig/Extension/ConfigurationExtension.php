<?php
namespace WhereGroup\CoreBundle\Twig\Extension;

use WhereGroup\CoreBundle\Component\Configuration;
use WhereGroup\PluginBundle\Component\Plugin;

/**
 * Class ConfigurationExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class ConfigurationExtension extends \Twig_Extension
{
    protected $configuration;
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
        return array(
            new \Twig_SimpleFunction('get_configuration', array($this, 'getConfiguration'))
        );
    }

    /**
     * @return null
     */
    public function getConfiguration()
    {
        $config = array();

        foreach ($this->plugin->getActivePlugins() as $pluginKey => $plugin) {
            if (!isset($plugin['settings']) || empty($plugin['settings'])) {
                continue;
            }

            foreach ($plugin['settings'] as $key => $setting) {
                if (!isset($setting['frontend']) || $setting['frontend'] !== true) {
                    continue;
                }

                /** @var \WhereGroup\CoreBundle\Entity\Configuration $conf */
                $config[$key] = $this->configuration->getValue(
                    $key,
                    'plugin',
                    $pluginKey,
                    isset($setting['default']) ? $setting['default'] : null
                );
            }
        }

        return $config;
    }
}
