<?php

use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Config\Loader\LoaderInterface;
use Symfony\Component\Yaml\Yaml;

class AppKernel extends Kernel
{
    private $plguinConfigFolder = '/../var/plugins/';
    private $pluginConfigFile   = 'plugins.yml';
    private $pluginRoutingFile  = 'plugins_routing.yml';

    public function registerBundles()
    {
        $bundles = array(
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Symfony\Bundle\MonologBundle\MonologBundle(),
            new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
            new Symfony\Bundle\AsseticBundle\AsseticBundle(),
            new Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
            new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),

            /******************************************************************
             * WhereGroup Metador Bundle's
             ******************************************************************/
            new WhereGroup\CoreBundle\WhereGroupCoreBundle(),
            new WhereGroup\ThemeBundle\WhereGroupThemeBundle(),
            new WhereGroup\UserBundle\WhereGroupUserBundle(),
            new WhereGroup\PluginBundle\WhereGroupPluginBundle(),

        );

        // Check file exists
        $this->checkPluginConfiguration($this->pluginRoutingFile);

        // Load plugins
        $config = $this->getPluginConfiguration($this->pluginConfigFile);

        if (isset($config['plugins'])) {
            foreach ($config['plugins'] as $name => $plugin) {
                if ($plugin['active']) {
                    $class = $plugin['class_path'] . '\\' . $plugin['class_name'];
                    $bundles[] = new $class;
                }
            }
        }

        if (in_array($this->getEnvironment(), array('dev', 'test'))) {
            $bundles[] = new Symfony\Bundle\DebugBundle\DebugBundle();
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            $bundles[] = new Sensio\Bundle\DistributionBundle\SensioDistributionBundle();
            $bundles[] = new Sensio\Bundle\GeneratorBundle\SensioGeneratorBundle();
        }

        return $bundles;
    }

    public function getCacheDir()
    {
        return $this->rootDir . '/../var/cache/' . $this->environment;
    }

    public function getLogDir()
    {
        return $this->rootDir . '/../var/logs';
    }

    public function registerContainerConfiguration(LoaderInterface $loader)
    {
        $loader->load($this->getRootDir().'/config/config_'.$this->getEnvironment().'.yml');
    }

    private function checkPluginConfiguration($filename)
    {
        $file = $this->rootDir . $this->plguinConfigFolder . $filename;

        if (!file_exists($file)) {
            file_put_contents($file, Yaml::dump(array(), 2));
        }
    }

    private function getPluginConfiguration($filename)
    {
        $this->checkPluginConfiguration($filename);

        return Yaml::parse(file_get_contents($this->rootDir . $this->plguinConfigFolder . $filename));
    }
}
