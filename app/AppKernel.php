<?php

use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Config\Loader\LoaderInterface;
use Symfony\Component\Yaml\Yaml;

class AppKernel extends Kernel
{
    public function registerBundles()
    {
        $bundles = array(
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Symfony\Bundle\MonologBundle\MonologBundle(),
            new Symfony\Bundle\AsseticBundle\AsseticBundle(),
            new Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
            new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),

            /******************************************************************
             * WhereGroup Metador Bundle's
             ******************************************************************/
            new WhereGroup\CoreBundle\WhereGroupCoreBundle(),
            new WhereGroup\ThemeBundle\WhereGroupThemeBundle(),
            new WhereGroup\UserBundle\WhereGroupUserBundle(),
            new WhereGroup\ExportBundle\WhereGroupExportBundle(),
            new WhereGroup\PluginBundle\WhereGroupPluginBundle(),
        );

        // Auslagern
        $pluginConfigFile = __DIR__ . '/config/plugins.yml';

        if (!file_exists($pluginConfigFile)) {
            file_put_contents($pluginConfigFile, Yaml::dump(array('plugins' => array()), 2));
        }

        $array = Yaml::parse($pluginConfigFile);

        foreach ($array['plugins'] as $name => $plugin) {
            if ($plugin['active']) {
                $bundles[] = new $plugin['class'];
            }
        }

        if (in_array($this->getEnvironment(), array('dev', 'test'))) {
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            $bundles[] = new Sensio\Bundle\DistributionBundle\SensioDistributionBundle();
            $bundles[] = new Sensio\Bundle\GeneratorBundle\SensioGeneratorBundle();
        }

        return $bundles;
    }

    public function registerContainerConfiguration(LoaderInterface $loader)
    {
        $loader->load(__DIR__.'/config/config_'.$this->getEnvironment().'.yml');
    }
}
