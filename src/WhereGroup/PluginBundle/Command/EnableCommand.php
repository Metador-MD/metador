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
 * Class ResetSuperuserCommand
 * @package WhereGroup\UserBundle\Command
 */
class EnableCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Enable plugin')
            ->setName('metador:enable:plugin')
            ->addArgument("keys", InputArgument::REQUIRED|InputArgument::IS_ARRAY, "One or more Plugin keys");
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io         = new SymfonyStyle($input, $output);
        $plugin     = $this->getContainer()->get('metador_plugin')->init();
        $translator = $this->getContainer()->get('translator');
        $keys        = $input->getArgument("keys");

        $io->title($translator->trans('plugin_command_enable_title'));

        foreach ($keys as $key) {
            if (is_null($plugin->getPlugin($key))) {
                $io->error($translator->trans('plugin_not_found', ['%key%' => $key]));
                return;
            }
        }

        foreach ($keys as $key) {
            $plugin->enable($key);
        }

        $plugin->saveConfiguration();
        $plugin->assetsInstall();
        $plugin->doctrineUpdate();
        $plugin->clearCache();

        $io->success($translator->trans('finished_successfully'));
    }
}
