<?php

namespace WhereGroup\PluginBundle\Command;

use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\Table;

/**
 * Class ListCommand
 * @package WhereGroup\PluginBundle\Command
 */
class ListCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Uninstall all plugins')
            ->setName('metador:list:plugins');
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $config = $this->getContainer()->get('metador_plugin')->getConfig();
        $plugins = array();

        foreach ($config['plugins'] as $key => $plugin) {
            $plugins[] = array(
                $key,
                $plugin['name'],
                $plugin['active'] ? 'yes' : 'no',
                $plugin['description']
            );
        }

        $table = new Table($output);
        $table
            ->setHeaders(array('Key', 'Name', 'Enabled', 'Description'))
            ->setRows($plugins)
        ;
        $table->render();
    }
}
