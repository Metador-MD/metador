<?php

namespace WhereGroup\PluginBundle\Command;

use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Class ListCommand
 * @package WhereGroup\PluginBundle\Command
 */
class ListCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Lists all available plugins')
            ->setName('metador:list:plugins');
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io         = new SymfonyStyle($input, $output);
        $config     = $this->getContainer()->get('metador_plugin')->getConfig();
        $translator = $this->getContainer()->get('translator');
        $plugins    = [];

        $io->title($translator->trans('plugin_command_list_title'));

        foreach ($config['plugins'] as $key => $plugin) {
            $plugins[] = [
                $key,
                $plugin['name'],
                $plugin['active'] ? 'yes' : 'no',
                $plugin['description']
            ];
        }

        $table = new Table($output);
        $table
            ->setHeaders(['Key', 'Name', 'Enabled', 'Description'])
            ->setRows($plugins)
        ;
        $table->render();
    }
}
