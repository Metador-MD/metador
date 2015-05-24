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

            // Translation
            new JMS\TranslationBundle\JMSTranslationBundle(),
            new JMS\DiExtraBundle\JMSDiExtraBundle($this),
            new JMS\AopBundle\JMSAopBundle(),

            /******************************************************************
             * WhereGroup Metador Bundle's
             ******************************************************************/
            new WhereGroup\CoreBundle\WhereGroupCoreBundle(),
            new WhereGroup\ThemeBundle\WhereGroupThemeBundle(),
            new WhereGroup\UserBundle\WhereGroupUserBundle(),
            new WhereGroup\PluginBundle\WhereGroupPluginBundle(),
        );

        // LOAD PLUGINS
        $pluginConfigFile = $this->rootDir . '/../var/plugins/plugins.yml';

        if (file_exists($pluginConfigFile)) {
            $array = Yaml::parse($pluginConfigFile);

            if (isset($array['plugins'])) {
                foreach ($array['plugins'] as $name => $plugin) {
                    if ($plugin['active']) {
                        $class = $plugin['class_path'] . '\\' . $plugin['class_name'];
                        $bundles[] = new $class;
                    }
                }
            }
        }

        if (in_array($this->getEnvironment(), array('dev', 'test'))) {
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
        $loader->load(__DIR__.'/config/config_'.$this->getEnvironment().'.yml');
    }
}
