<?php

namespace WhereGroup\PluginBundle\Tests\WhereGroup\PluginBundle\Component;

use WhereGroup\PluginBundle\Component\Plugin;

class PluginTest extends \PHPUnit_Framework_TestCase
{
    public function testGetPlugins()
    {
        $rootDir      = __DIR__ . '/../../../../../../..';
        $cacheDir     = $rootDir . '/testdata/cache/';
        $environment  = 'prod';
        $configFolder = 'testdata/config/';
        $pluginPaths  = $rootDir . '/testdata/Plugins';

        file_put_contents($configFolder . 'plugins.yml', 'plugins: {}');

        $plugin = new Plugin($rootDir, $cacheDir, $environment, $configFolder, $pluginPaths);

        $plugins = $plugin->getPlugins();

        $this->assertCount(2, $plugins);
        $this->assertNotEmpty($plugins['example-hello-world']['new']);


        $plugin = new Plugin($rootDir, $cacheDir, $environment, $configFolder, $pluginPaths);
        $plugins = $plugin->getPlugins();

        $this->assertFalse(isset($plugins['example-hello-world']['new']));
    }
}
