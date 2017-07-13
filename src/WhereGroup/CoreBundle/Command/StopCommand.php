<?php

namespace WhereGroup\CoreBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;

/**
 * Class StopCommand
 * @package WhereGroup\CoreBundle\Command
 */
class StopCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Stop application')
            ->setName('metador:stop');
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Stop application');

        $serviceFile = $this->getContainer()->getParameter('maintenance_file');
        $rootDir = $this->getContainer()->get('kernel')->getRootDir() . '/../';
        $tmpDir =  $rootDir . 'var/temp/';
        $webDir = $rootDir . 'web/';

        $fs = new Filesystem();

        if ($fs->exists($tmpDir . 'app.php')) {
            $io->warning('Anwendung befindet sich bereits im Wartungsmodus!');
            exit;
        } elseif (!$fs->exists($webDir . 'app.php')) {
            $io->warning('System Datei nicht gefunden!');
            exit;
        } elseif (!$fs->exists($serviceFile)) {
            $io->warning('Wartungsdatei nicht gefunden!');
            exit;
        }

        $fs->rename($webDir . 'app.php', $tmpDir . 'app.php');
        $fs->copy($serviceFile, $webDir . 'app.php');

        $io->success('Anwendung befindet sich nun im Wartungsmodus.');
    }
}
