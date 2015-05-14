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

        // LOAD PLUGINS
        $pluginConfigFile = __DIR__ . '/config/plugins.yml';

        if (file_exists($pluginConfigFile)) {
            $array = Yaml::parse($pluginConfigFile);

            if (isset($array['plugins'])) {
                foreach ($array['plugins'] as $name => $plugin) {
                    if ($plugin['active']) {
                        $bundles[] = new $plugin['class_path'] . '/' . $plugin['class_name'];
                    }
                }
            }
        }

        if (in_array($this->getEnvironment(), array('dev', 'test'))) {
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            $bundles[] = new Sensio\Bundle\DistributionBundle\SensioDistributionBundle();
            $bundles[] = new Sensio\Bundle\GeneratorBundle\SensioGeneratorBundle();

            // Translation
            $bundles[] = new JMS\TranslationBundle\JMSTranslationBundle();
            $bundles[] = new JMS\DiExtraBundle\JMSDiExtraBundle($this);
            $bundles[] = new JMS\AopBundle\JMSAopBundle();
        }

        return $bundles;
    }

    public function registerContainerConfiguration(LoaderInterface $loader)
    {
        $loader->load(__DIR__.'/config/config_'.$this->getEnvironment().'.yml');
    }
}
