<?php

namespace WhereGroup\PluginBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Console\Input\ArgvInput;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\Process\Process;

class PluginRepository
{
    private $repositories;
    private $version;

    public function __construct($repositories, $version)
    {
        $this->repositories = $repositories;
        $this->version = $version;
    }

    public function getPlugins()
    {
        die('<pre>' . print_r($this->version, 1) . '</pre>');
        // foreach ($this->repositories as $url) {

        // }

        // die('<pre>' . print_r(file_get_contents($repos[0] . '/2.1/index.json'), 1) . '</pre>');
    }
}
