<?php

namespace WhereGroup\PluginBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Console\Input\ArgvInput;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\Process\Process;

/**
 * Class Plugin
 * @package WhereGroup\PluginBundle\Component
 * @author A.R.Pour
 */
class Plugin
{
    protected $container;
    protected $rootDir;
    protected $configurationFile;
    protected $routingFile;
    protected $pluginPaths = array();
    protected $plugins = array();
    protected $routing = array();
    protected $requiredPlugins = array();

    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;

        // get plugin path's
        $this->rootDir           = $this->container->get('kernel')->getRootDir() . '/';
        $this->configurationFile = $this->rootDir . '../var/plugins/plugins.yml';
        $this->routingFile       = $this->rootDir . '../var/plugins/plugins_routing.yml';
        $this->pluginPaths       = array(
            $this->rootDir . '../src/WhereGroup/Plugin/',
            $this->rootDir . '../src/User/Plugin/'
        );

        // load configuration
        $configuration = $this->getPluginConfiguration();
        $this->routing = $this->getPluginRouting();
        $plugins       = $this->findPlugins();

        // remove not existing bundles
        foreach ($configuration['plugins'] as $key => $plugin) {
            if (!isset($plugins[$key])) {
                unset($configuration['plugins'][$key]);
            }
        }

        foreach ($plugins as $name => $plugin) {
            // tag new plugins
            if (!isset($configuration['plugins'][$name])) {
                $plugin['active'] = false;
                $plugin['new'] = true;
                $configuration['plugins'][$name] = $plugin;

            // remove new tag
            } elseif (isset($configuration['plugins'][$name]['new'])) {
                unset($configuration['plugins'][$name]['new']);

            // override old configuration
            } else {
                $configuration['plugins'][$name]
                    = array_merge($configuration['plugins'][$name], $plugin);
            }
        }

        $this->plugins = $configuration['plugins'];
        ksort($this->plugins);

        $this->saveConfiguration();

        unset($configuration, $plugins);
    }

    /**
     *
     */
    public function __destruct()
    {
        unset($this->container);
    }

    /**
     * @return array
     */
    public function getPlugins()
    {
        return $this->plugins;
    }

    /**
     * @param $request
     * @param $redirect
     */
    public function update($request)
    {
        $plugins = empty($request['plugins']) ? array() : array_flip(explode(',', $request['plugins']));

        foreach ($this->plugins as $key => $plugin) {
            if (isset($plugins[$key])) {
                $this->enable($key);
            } else {
                $this->disable($key);
            }
        }

        foreach ($this->requiredPlugins as $requiredPlugin) {
            $this->enable($requiredPlugin);
        }

        $this->saveConfiguration();

        return array(
            'output' => 'done'
        );
    }

    /**
     *
     */
    protected function saveConfiguration()
    {
        $this->writeYaml($this->configurationFile, array('plugins' => $this->plugins));
        $this->writeYaml($this->routingFile, $this->routing);
    }

    /**
     * @return array
     */
    protected function getPluginConfiguration()
    {
        if (!file_exists($this->configurationFile)) {
            $this->writeYaml($this->configurationFile, array('plugins' => array()));
        }

        return $this->readYaml($this->configurationFile);
    }

    /**
     * @return array
     */
    protected function getPluginRouting()
    {
        if (!file_exists($this->routingFile)) {
            $this->writeYaml($this->routingFile, array());
        }

        return $this->readYaml($this->routingFile);
    }

    /**
     * @return array
     */
    public function findPlugins()
    {
        $plugins = array();
        $finder = new Finder();

        $finder->files()
            ->in($this->pluginPaths)
            ->path('Resources/config/')
            ->name('plugin.yml');

        foreach ($finder as $file) {
            $pluginDefinition = $this->readYaml($file->getRealpath());

            if (is_array($pluginDefinition)) {
                $plugins[key($pluginDefinition)]
                    = $pluginDefinition[key($pluginDefinition)];
            }
        }

        return $plugins;
    }

    /**
     * @param $key
     * @param $plugin
     */
    protected function enable($key)
    {
        $this->plugins[$key]['active'] = true;

        if (isset($this->plugins[$key]['require'])) {
            foreach ($this->plugins[$key]['require'] as $require) {
                if (!isset($this->plugins[$require])) {
                    throw new \RuntimeException("Plugin $require not found!");
                }

                $this->requiredPlugins[] = $require;
            }
        }

        $routing = $this->locateResource($this->plugins[$key]['class_path'], 'config/routing.yml');

        if ($routing) {
            $this->routing[trim(str_replace('-', '_', $key))] = array(
                'resource' => '@' . $this->plugins[$key]['class_name'] . '/Resources/config/routing.yml'
            );
        }
    }

    /**
     * @param $key
     * @param $plugin
     */
    protected function disable($key)
    {
        $this->plugins[$key]['active'] = false;

        if (isset($this->routing[trim(str_replace('-', '_', $key))])) {
            unset($this->routing[trim(str_replace('-', '_', $key))]);
        }
    }

    /**
     * @param $bundlePath
     * @param $path
     * @return bool|string
     */
    protected function locateResource($bundlePath, $path)
    {
        $fs = new Filesystem();

        $path = $this->rootDir . '../src/'
            . ltrim(rtrim(str_replace('\\', '/', $bundlePath), '/'), '/')
            . '/Resources/' . ltrim($path, '/');

        if ($fs->exists($path)) {
            return $path;
        }

        return false;
    }

    /**
     * @param $file
     * @return array
     */
    public function readYaml($file)
    {
        return Yaml::parse($file);
    }

    /**
     * @param $file
     * @param $array
     * @return $this
     */
    public function writeYaml($file, $array)
    {
        file_put_contents($file, Yaml::dump($array, 2));

        return $this;
    }

    public function assetsInstall()
    {
        $env     = $this->container->get('kernel')->getEnvironment();
        $console = $this->rootDir . 'console';

        if ($env === 'dev') {
            $command = "$console assets:install --symlink --no-debug --env=$env $this->rootDir../web/";
        } else {
            $command = "$console assets:install --no-debug --env=$env $this->rootDir../web/";
        }

        $process = new Process($command);
        $process->run();

        return array(
            'output' => $process->getOutput()
        );
    }

    public function doctrineUpdate()
    {
        $console = $this->rootDir . 'console';

        $process = new Process("$console doctrine:schema:update --force --no-debug");
        $process->run();

        return array(
            'output' => $process->getOutput()
        );
    }

    public function clearCache()
    {
        $fs  = new Filesystem();
        $fs->remove($this->container->getParameter('kernel.cache_dir'));

        return array(
            'output' => 'done'
        );
    }
}
