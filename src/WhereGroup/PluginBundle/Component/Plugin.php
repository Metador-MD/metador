<?php

namespace WhereGroup\PluginBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Filesystem\Filesystem;

class Plugin
{
    protected $container;
    protected $rootDir;
    protected $configurationFile;
    protected $pluginPaths = array();
    protected $plugins = array();

    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;

        // get plugin path's
        $this->rootDir           = $this->container->get('kernel')->getRootDir() . '/';
        $this->configurationFile = $this->rootDir . 'config/plugins.yml';
        $this->pluginPaths       = array(
            $this->rootDir . '../src/WhereGroup/Plugin/',
            $this->rootDir . '../src/User/Plugin/'
        );

        $this->updateConfiguration();
    }

    public function __destruct()
    {
        unset($this->container);
    }


    public function getPlugins()
    {
        return $this->plugins;
    }

    public function update($request, $redirect)
    {
        $plugins = empty($request['plugin']) ? array() : $request['plugin'];

        foreach ($this->plugins as $key => $plugin) {
            // enable
            if (isset($plugins[$key])) {
                $this->plugins[$key]['active'] = true;
            // disable
            } else {
                $this->plugins[$key]['active'] = false;
            }
        }

        $this->writeYaml(
            $this->configurationFile,
            array('plugins' => $this->plugins)
        );

        $this->clearCache($redirect);
    }

    public function updateConfiguration()
    {
        $configuration = $this->getConfiguration();

        foreach ($this->findPlugins() as $name => $plugin) {
            if (!isset($configuration['plugins'][$name])) {
                $plugin['active'] = false;
                $plugin['new'] = true;
                $configuration['plugins'][$name] = $plugin;
            } elseif (isset($configuration['plugins'][$name]['new'])) {
                unset($configuration['plugins'][$name]['new']);
            }
        }

        $this->plugins = $configuration['plugins'];
        $this->writeYaml($this->configurationFile, $configuration);
    }

    public function getConfiguration()
    {
        if (!file_exists($this->configurationFile)) {
            $this->writeYaml($this->configurationFile, array('plugins' => array()));
        }

        return $this->readYaml($this->configurationFile);
    }

    public function findPlugins()
    {
        $plugins = array();

        // get available plugins
        foreach ($this->pluginPaths as $path) {
            if (!is_dir($path)) {
                continue;
            }

            foreach (scandir($path) as $file) {
                if ($file === '.' || $file === '..' || !is_dir($path . $file)) {
                    continue;
                }

                $pluginDefinitionFile = $path . $file . '/Resources/config/plugin.yml';

                if (!file_exists($pluginDefinitionFile) || !is_readable($pluginDefinitionFile)) {
                    continue;
                }

                $pluginDefinition = $this->readYaml($pluginDefinitionFile);

                $plugins[key($pluginDefinition)]
                    = $pluginDefinition[key($pluginDefinition)];
            }
        }

        return $plugins;
    }

    public function readYaml($file)
    {
        return Yaml::parse($file);
    }

    public function writeYaml($file, $array)
    {
        file_put_contents($file, Yaml::dump($array, 2));

        return $this;
    }

    public function clearCache($redirect)
    {
        $url = $this->container->get('router')->generate($redirect);
        $fs  = new Filesystem();
        $fs->remove($this->container->getParameter('kernel.cache_dir'));
        sleep(5);
        header('Location: ' . $url);
        exit;
    }
}
