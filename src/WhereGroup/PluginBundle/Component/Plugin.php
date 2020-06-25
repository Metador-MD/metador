<?php

namespace WhereGroup\PluginBundle\Component;

use Exception;
use RuntimeException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Process\Process;
use WhereGroup\CoreBundle\Component\Cache;
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
    protected $pluginPaths = [];
    protected $plugins = [];
    protected $routing = [];
    protected $configuration = null;
    protected $cache;
    protected $kernel;

    /**
     * Plugin constructor.
     * @param ConfigurationInterface $configuration
     * @param Cache $cache
     * @param KernelInterface $kernel
     * @param $rootDir
     * @param $cacheDir
     * @param $environment
     * @param string $configFolder
     * @param null $pluginPaths
     */
    public function __construct(
        ConfigurationInterface $configuration,
        Cache $cache,
        KernelInterface $kernel,
        $rootDir,
        $cacheDir,
        $environment,
        $configFolder = '../var/config/',
        $pluginPaths = null
    ) {
        // get plugin path's
        $this->cache             = $cache;
        $this->kernel            = $kernel;
        $this->rootDir           = $rootDir . '/';
        $this->cacheDir          = $cacheDir;
        $this->env               = $environment;
        $this->configurationFile = $this->rootDir . $configFolder . 'plugins.yml';
        $this->routingFile       = $this->rootDir . $configFolder . 'plugins_routing.yml';
        $this->pluginPaths       = $pluginPaths;
        $this->configuration     = $configuration;
        $this->routing           = $this->getPluginRouting();

        if (is_null($this->pluginPaths)) {
            $this->pluginPaths = [
                $this->rootDir . '../src/Plugins/'
            ];
        }

        // load configuration
        $configuration = $this->getPluginConfiguration();
        $this->plugins = $configuration['plugins'];
        ksort($this->plugins);

        unset($configuration);
    }

    /**
     * @return $this
     */
    public function init()
    {
        // load configuration
        $configuration = $this->getPluginConfiguration();
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

        return $this;
    }

    /**
     * @return array
     */
    public function getConfig()
    {
        return [
            'rootDir'           => $this->rootDir,
            'cacheDir'          => $this->cacheDir,
            'configurationFile' => $this->configurationFile,
            'routingFile'       => $this->routingFile,
            'pluginPaths'       => $this->pluginPaths,
            'plugins'           => $this->plugins,
            'routing'           => $this->routing,
        ];
    }

    /**
     * @param null $groupBy
     * @return array
     */
    public function getPlugins($groupBy = null)
    {
        if ($groupBy === 'origin') {
            $result = [];

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
        $result = [];
        $plugins = $this->plugins;
        $core = Yaml::parse(file_get_contents(__DIR__ . '/../../CoreBundle/Resources/config/plugin.yml'));

        foreach (array_merge_recursive($core, $plugins) as $key => $plugin) {
            if (isset($plugin['active']) && $plugin['active']) {
                $result[$key] = $plugin;
            }
        }

        return $result;
    }

    /**
     * @param $profile
     * @param $resource
     * @return bool|string
     * @throws Exception
     */
    public function getResource($profile, $resource)
    {
        $filepath = $this->kernel->locateResource(
            '@' . $this->getPluginClassName($profile) . '/Resources/' . $resource
        );

        if (!file_exists($filepath) || !is_readable($filepath)) {
            throw new Exception("File not found or not readable!");
        }

        return file_get_contents($filepath);
    }

    /**
     * @return array
     */
    public function getActiveProfiles()
    {
        $result = [];

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
     * @throws Exception
     */
    public function getPluginParameter($plugin, $parameter)
    {
        if (!$this->hasPluginParameter($plugin, $parameter)) {
            throw new Exception("Unknown plugin or paramter");
        }

        return $this->plugins[$plugin][$parameter];
    }

    /**
     * @param $plugin
     * @return mixed
     * @throws Exception
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
        $plugins = empty($request['plugins']) ? [] : array_flip(explode(',', $request['plugins']));

        foreach ($this->plugins as $key => $plugin) {
            if (isset($plugins[$key])) {
                $this->enable($key);
            } else {
                $this->disable($key);
            }
        }

        $this->saveConfiguration();

        return [
            'output' => 'done'
        ];
    }

    /**
     * @return array
     */
    protected function sortPlugins()
    {
        $plugins = [];
        $require = [
            'hasChildren' => [],
            'hasParent'   => [],
            'isSingle'    => []
        ];

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
        $this->writeYaml($this->configurationFile, ['plugins' => $this->sortPlugins()]);
        $this->writeYaml($this->routingFile, $this->routing);
    }

    /**
     * @return array
     */
    protected function getPluginConfiguration()
    {
        $configuration = $this->readYaml($this->configurationFile);

        if (!isset($configuration['plugins'])) {
            $configuration['plugins'] = [];
        }

        return $configuration;
    }

    /**
     * @return array
     */
    protected function getPluginRouting()
    {
        if (!file_exists($this->routingFile)) {
            $this->writeYaml($this->routingFile, []);
        }

        return $this->readYaml($this->routingFile);
    }

    /**
     * @return array
     */
    public function findPlugins()
    {
        $plugins = [];
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
                    throw new RuntimeException("Plugin $require not found!");
                }

                $this->enable($require);
            }
        }

        // Add routing
        $routing = $this->locateResource($this->plugins[$key]['class_path'], 'config/routing.yml');

        if ($routing) {
            $this->routing[trim(str_replace('-', '_', $key))] = [
                'resource' => '@' . $this->plugins[$key]['class_name'] . '/Resources/config/routing.yml'
            ];
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
        $console = $this->rootDir . '../bin/console';

        if ($this->env === 'dev') {
            $command = "$console assets:install --symlink --no-debug --env=$this->env $this->rootDir../web/";
        } else {
            $command = "$console assets:install --no-debug --env=$this->env $this->rootDir../web/";
        }

        $process = new Process($command);
        $process->run();

        return [
            'output' => $process->getOutput()
        ];
    }

    /**
     * @return array
     */
    public function doctrineUpdate()
    {
        $process = new Process($this->rootDir . "../bin/console doctrine:schema:update --force --no-debug");
        $process->run();

        return [
            'output' => $process->getOutput()
        ];
    }

    /**
     * @return array
     */
    public function clearCache()
    {
        $process = new Process([$this->rootDir . '../bin/console', 'cache:clear', '--env=' . $this->env]);
        $process->run();

        $this->warmupCache();

        return [
            'output' => $process->getOutput()
        ];
    }

    /**
     * @return string
     */
    public function warmupCache()
    {
        $process = new Process([$this->rootDir . '../bin/console', 'cache:warmup', '--env=' . $this->env]);
        $process->run();

        sleep(5);

        return $process->getOutput();
    }
}
