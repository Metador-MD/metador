<?php

use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Config\Loader\LoaderInterface;
use Symfony\Component\Yaml\Yaml;

/**
 * Class AppKernel
 */
class AppKernel extends Kernel
{
    private $plguinConfigFolder = '/../var/config/';
    private $pluginConfigFile   = 'plugins.yml';
    private $pluginRoutingFile  = 'plugins_routing.yml';

    /**
     * @return array
     */
    public function registerBundles()
    {
        $bundles = array(
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Symfony\Bundle\MonologBundle\MonologBundle(),
            new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
            new Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
            new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),

            /******************************************************************
             * WhereGroup Metador Bundle's
             ******************************************************************/
            new WhereGroup\CoreBundle\MetadorCoreBundle(),
            new WhereGroup\ThemeBundle\MetadorThemeBundle(),
            new WhereGroup\UserBundle\MetadorUserBundle(),
            new WhereGroup\PluginBundle\MetadorPluginBundle(),

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

        if (in_array($this->getEnvironment(), array('dev', 'test'), true)) {
            $bundles[] = new Symfony\Bundle\DebugBundle\DebugBundle();
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            $bundles[] = new Sensio\Bundle\DistributionBundle\SensioDistributionBundle();
            $bundles[] = new Sensio\Bundle\GeneratorBundle\SensioGeneratorBundle();
        }

        return $bundles;
    }

    /**
     * @return string
     */
    public function getCacheDir()
    {
        return $this->rootDir . '/../var/cache/' . $this->environment;
    }

    /**
     * @return string
     */
    public function getLogDir()
    {
        return $this->rootDir . '/../var/logs';
    }

    /**
     * @param LoaderInterface $loader
     */
    public function registerContainerConfiguration(LoaderInterface $loader)
    {
        $loader->load($this->getRootDir().'/config/config_'.$this->getEnvironment().'.yml');
    }

    /**
     * @param $filename
     */
    private function checkPluginConfiguration($filename)
    {
        $file = $this->rootDir . $this->plguinConfigFolder . $filename;

        if (!file_exists($file)) {
            file_put_contents($file, Yaml::dump(array(), 2));
        }
    }

    /**
     * @param $filename
     * @return mixed
     */
    private function getPluginConfiguration($filename)
    {
        $this->checkPluginConfiguration($filename);

        return Yaml::parse(file_get_contents($this->rootDir . $this->plguinConfigFolder . $filename));
    }
}
