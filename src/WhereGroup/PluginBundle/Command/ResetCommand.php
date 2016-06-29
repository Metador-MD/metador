<?php

namespace WhereGroup\PluginBundle\Command;

use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;


/**
 * Class ResetCommand
 * @package WhereGroup\PluginBundle\Command
 */
class ResetCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Uninstall all plugins')
            ->setName('metador:reset:plugins');
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $plugin = $this->getContainer()->get('metador_plugin');
        $config = $plugin->getConfig();

        if (isset($config['configurationFile']) && file_exists($config['configurationFile'])) {
            file_put_contents($config['configurationFile'], Yaml::dump(array(), 2));
        }

        if (isset($config['routingFile']) && file_exists($config['routingFile'])) {
            file_put_contents($config['routingFile'], Yaml::dump(array(), 2));
        }

        $plugin->assetsInstall();
        $plugin->clearCache();

        $output->writeln('Done');
    }
}
