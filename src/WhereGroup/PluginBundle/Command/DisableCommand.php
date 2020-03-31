<?php

namespace WhereGroup\PluginBundle\Command;

use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Style\SymfonyStyle;

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
        $io         = new SymfonyStyle($input, $output);
        $plugin     = $this->getContainer()->get('metador_plugin');
        $translator = $this->getContainer()->get('translator');
        $key        = $input->getArgument("key");

        $io->title($translator->trans('plugin_command_disable_title'));

        if (is_null($plugin->init()->getPlugin($key))) {
            $io->error($translator->trans('plugin_not_found'));
            return;
        }

        $plugin->disable($key);
        $plugin->saveConfiguration();
        $plugin->assetsInstall();
        $plugin->doctrineUpdate();
        $plugin->clearCache();

        $io->success($translator->trans('finished_successfully'));
    }
}
