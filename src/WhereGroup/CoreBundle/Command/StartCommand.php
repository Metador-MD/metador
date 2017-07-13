<?php

namespace WhereGroup\CoreBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;

/**
 * Class StartCommand
 * @package WhereGroup\CoreBundle\Command
 */
class StartCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Start application')
            ->setName('metador:start');
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Start application');

        $serviceFile = $this->getContainer()->getParameter('maintenance_file');
        $rootDir = $this->getContainer()->get('kernel')->getRootDir() . '/../';
        $tmpDir =  $rootDir . 'var/temp/';
        $webDir = $rootDir . 'web/';

        $fs = new Filesystem();

        if (!$fs->exists($tmpDir . 'app.php')) {
            $io->warning('System Datei nicht gefunden!');
            exit;
        } elseif (!$fs->exists($serviceFile)) {
            $io->warning('Wartungsdatei nicht gefunden!');
            exit;
        }

        $fs->remove($webDir . 'app.php');
        $fs->rename($tmpDir . 'app.php', $webDir . 'app.php');

        $io->success('Anwendung ist wieder erreichbar.');
    }
}
