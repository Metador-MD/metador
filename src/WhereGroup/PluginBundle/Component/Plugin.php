<?php

namespace WhereGroup\PluginBundle\Component;

use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Console\Input\ArgvInput;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\Process\Process;
use WhereGroup\CoreBundle\Component\ConfigurationInterface;

/**
 * Class Plugin
 * @package WhereGroup\PluginBundle\Component
 * @author A.R.Pour
 */
class Plugin
{
    protected $rootDir;
    protected $cacheDir;
    protected $env;
    protected $configurationFile;
    protected $routingFile;
    protected $pluginPaths = array();
    protected $plugins = array();
    protected $routing = array();
    protected $configuration = null;

    /**
     * Plugin constructor.
     * @param ConfigurationInterface $configuration
     * @param $rootDir
     * @param $cacheDir
     * @param $environment
     * @param string $configFolder
     * @param null $pluginPaths
     */
    public function __construct(
        ConfigurationInterface $configuration,
        $rootDir,
        $cacheDir,
        $environment,
        $configFolder = '../var/config/',
        $pluginPaths = null
    ) {
        // get plugin path's
        $this->rootDir           = $rootDir . '/';
        $this->cacheDir          = $cacheDir;
        $this->env               = $environment;
        $this->configurationFile = $this->rootDir . $configFolder . 'plugins.yml';
        $this->routingFile       = $this->rootDir . $configFolder . 'plugins_routing.yml';
        $this->pluginPaths       = $pluginPaths;
        $this->configuration = $configuration;

        if (is_null($this->pluginPaths)) {
            $this->pluginPaths       = array(
                $this->rootDir . '../src/Plugins/'
            );
        }

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
     * @return array
     */
    public function getConfig()
    {
        return array(
            'rootDir'           => $this->rootDir,
            'cacheDir'          => $this->cacheDir,
            'configurationFile' => $this->configurationFile,
            'routingFile'       => $this->routingFile,
            'pluginPaths'       => $this->pluginPaths,
            'plugins'           => $this->plugins,
            'routing'           => $this->routing,
        );
    }

    /**
     * @return array
     */
    public function getPlugins($groupBy = null)
    {
        if ($groupBy === 'origin') {
            $result = array();

            foreach ($this->plugins as $key => $plugin) {
                $result[$plugin['origin']][$key] = $plugin;
            }

            return $result;
        }

        return $this->plugins;
    }

    /**
     * @return array
     */
    public function getActivePlugins()
    {
        $result = array();

        foreach ($this->plugins as $key => $plugin) {
            if (isset($plugin['active']) && $plugin['active']) {
                $result[$key] = $plugin;
            }
        }

        return $result;
    }

    /**
     * @return array
     */
    public function getActiveProfiles()
    {
        $result = array();

        foreach ($this->plugins as $key => $plugin) {
            if (isset($plugin['type']) && strtolower($plugin['type']) === 'profile' &&
                isset($plugin['active']) && $plugin['active']) {
                $result[$key] = $plugin;
            }
        }

        return $result;
    }

    /**
     * @param $plugin
     * @return mixed|null
     */
    public function getPlugin($plugin)
    {
        return isset($this->plugins[$plugin])
            ? $this->plugins[$plugin]
            : null;
    }

    /**
     * @param $plugin
     * @param $parameter
     * @return bool
     */
    public function hasPluginParameter($plugin, $parameter)
    {
        return isset($this->plugins[$plugin][$parameter])
            ? true
            : false;
    }

    /**
     * @param $plugin
     * @param $parameter
     * @return mixed
     * @throws \Exception
     */
    public function getPluginParameter($plugin, $parameter)
    {
        if (!$this->hasPluginParameter($plugin, $parameter)) {
            throw new \Exception("Unknown plugin or paramter");
        }

        return $this->plugins[$plugin][$parameter];
    }

    /**
     * @param $plugin
     * @return mixed
     * @throws \Exception
     */
    public function getPluginClassName($plugin)
    {
        return $this->getPluginParameter($plugin, 'class_name');
    }

    /**
     * @param $request
     * @return array
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

        $this->saveConfiguration();

        return array(
            'output' => 'done'
        );
    }

    /**
     * @return array
     */
    protected function sortPlugins()
    {
        $plugins = array();
        $require = array(
            'hasChildren' => array(),
            'hasParent'   => array(),
            'isSingle'    => array()
        );

        // get plugin informations
        foreach ($this->plugins as $key => $value) {
            if (isset($value['require']) && !empty($value['require'])) {
                foreach ($value['require'] as $plugin) {
                    $require['hasChildren'][$plugin][$key] = true;
                    $require['hasParent'][$key][$plugin] = true;
                }
            } else {
                $require['isSingle'][] = $key;
            }
        }

        // sort
        while (!empty($require['hasChildren'])) {
            foreach ($require['hasChildren'] as $key => $value) {
                if (!isset($require['hasParent'][$key])) {
                    // add plugin
                    $plugins[$key] = $this->plugins[$key];

                    unset($this->plugins[$key]);

                    // clean children array
                    unset($require['hasChildren'][$key]);

                    // clean parent array
                    foreach ($require['hasParent'] as $pKey => $pValue) {
                        if (isset($require['hasParent'][$pKey][$key])) {
                            unset($require['hasParent'][$pKey][$key]);
                            if (empty($require['hasParent'][$pKey])) {
                                unset($require['hasParent'][$pKey]);
                            }
                        }
                    }
                }
            }
        }

        unset($require);

        foreach ($this->plugins as $key => $value) {
            // add rest
            $plugins[$key] = $this->plugins[$key];
        }

        return $this->plugins = $plugins;
    }

    /**
     *
     */
    public function saveConfiguration()
    {
        $this->writeYaml($this->configurationFile, array('plugins' => $this->sortPlugins()));
        $this->writeYaml($this->routingFile, $this->routing);
    }

    /**
     * @return array
     */
    protected function getPluginConfiguration()
    {
        $configuration = $this->readYaml($this->configurationFile);

        if (!isset($configuration['plugins'])) {
            $configuration['plugins'] = array();
        }

        return $configuration;
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

        $finder
            ->followLinks()
            ->files()
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
     * @param $plugin
     * @return bool|string
     */
    public function locate($plugin)
    {
        $fs = new Filesystem();

        $path = $this->rootDir . '../src/'
            . ltrim(rtrim(str_replace('\\', '/', $this->plugins[$plugin]['class_path']), '/'), '/');

        if ($fs->exists($path)) {
            return $path;
        }

        return false;
    }

    /**
     * @param $plugin
     * @return bool
     */
    public function delete($plugin)
    {
        $path = $this->locate($plugin);

        if ($path) {
            $fs = new Filesystem();
            $fs->remove($path);

            return true;
        }

        // TODO: exception
    }

    /**
     * @param $key
     */
    public function enable($key)
    {
        $this->plugins[$key]['active'] = true;

        // siblings allowed?
        if (isset($this->plugins[$key]['siblings'])
            && !empty($this->plugins[$key]['type'])
            && $this->plugins[$key]['siblings'] === false) {
            foreach ($this->plugins as $pluginKey => $plugin) {
                if (isset($this->plugins[$pluginKey]['type'])
                    && $pluginKey !== $key
                    && $this->plugins[$pluginKey]['type'] === $this->plugins[$key]['type']
                    && $this->plugins[$pluginKey]['active'] === true) {
                    $this->disable($pluginKey);
                }
            }
        }

        if (isset($this->plugins[$key]['require'])) {
            foreach ($this->plugins[$key]['require'] as $require) {
                if (!isset($this->plugins[$require])) {
                    throw new \RuntimeException("Plugin $require not found!");
                }

                $this->enable($require);
            }
        }

        // Add routing
        $routing = $this->locateResource($this->plugins[$key]['class_path'], 'config/routing.yml');

        if ($routing) {
            $this->routing[trim(str_replace('-', '_', $key))] = array(
                'resource' => '@' . $this->plugins[$key]['class_name'] . '/Resources/config/routing.yml'
            );
        }

        // Add default configuration to database
        if (isset($this->plugins[$key]['settings'])) {
            foreach ($this->plugins[$key]['settings'] as $settingKey => $setting) {
                if (!isset($setting['default'])) {
                    continue;
                }

                $this
                    ->configuration
                    ->set($settingKey, $setting['default'], 'plugin', $key);
            }
        }
    }

    /**
     * @param $key
     */
    public function disable($key)
    {
        $this->plugins[$key]['active'] = false;

        if (isset($this->routing[trim(str_replace('-', '_', $key))])) {
            unset($this->routing[trim(str_replace('-', '_', $key))]);
        }

        // Remove default configuration to database
        if (isset($this->plugins[$key]['settings'])) {
            foreach ($this->plugins[$key]['settings'] as $settingKey => $setting) {
                $this->configuration->remove($settingKey, 'plugin', $key);
            }
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
    protected function readYaml($file)
    {
        return Yaml::parse(file_get_contents($file));
    }

    /**
     * @param $file
     * @param $array
     * @return $this
     */
    protected function writeYaml($file, $array)
    {
        file_put_contents($file, Yaml::dump($array, 2));

        return $this;
    }

    /**
     * @return array
     */
    public function assetsInstall()
    {
        $console = $this->rootDir . 'console';

        if ($this->env === 'dev') {
            $command = "$console assets:install --symlink --no-debug --env=$this->env $this->rootDir../web/";
        } else {
            $command = "$console assets:install --no-debug --env=$this->env $this->rootDir../web/";
        }

        $process = new Process($command);
        $process->run();

        return array(
            'output' => $process->getOutput()
        );
    }

    /**
     * @return array
     */
    public function doctrineUpdate()
    {
        $console = $this->rootDir . 'console';

        $process = new Process("$console doctrine:schema:update --force --no-debug");
        $process->run();

        return array(
            'output' => $process->getOutput()
        );
    }

    /**
     * @return array
     */
    public function clearCache()
    {
        $fs  = new Filesystem();
        $fs->remove($this->cacheDir);

        return array(
            'output' => 'done'
        );
    }
}
