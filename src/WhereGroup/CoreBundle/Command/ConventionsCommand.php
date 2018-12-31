<?php

namespace WhereGroup\CoreBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use WhereGroup\CoreBundle\Component\Conventions\Conventions;

/**
 * Class ConventionsCommand
 * @package WhereGroup\CoreBundle\Command
 */
class ConventionsCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Check code for conventions')
            ->setName('metador:test:conventions')
            ->addOption('path', 'p', InputOption::VALUE_REQUIRED, 'Path to code', 'src/')
        ;
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|void|null
     * @throws \Exception
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);
        $io->title("Conventions check");

        $path = $input->getOption('path');

        if (empty($path)) {
            throw new \Exception("Path not found.");
        }

        $convention = (new Conventions($path))->scan()->showErrors($io);

        if ($convention->hasError()) {
            exit(1);
        }

        $io->success("No convention violations found :D");
    }
}
