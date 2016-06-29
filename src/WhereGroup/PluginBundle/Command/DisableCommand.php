<?php

namespace WhereGroup\PluginBundle\Command;

use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;

/**
 * Class DisableCommand
 * @package WhereGroup\PluginBundle\Command
 */
class DisableCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Disable plugin')
            ->setName('metador:disable:plugin')
            ->addArgument("key", InputArgument::REQUIRED, "Plugin key");
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $plugin = $this->getContainer()->get('metador_plugin');
        $key = $input->getArgument("key");

        if (is_null($plugin->getPlugin($key))) {
            $output->writeln('Plugin not found!');
            return;
        }

        $plugin->disable($key);
        $plugin->saveConfiguration();
        $plugin->assetsInstall();
        $plugin->doctrineUpdate();
        $plugin->clearCache();

        $output->writeln('Done..');
    }
}
