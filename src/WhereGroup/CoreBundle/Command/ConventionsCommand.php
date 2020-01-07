<?php

namespace WhereGroup\CoreBundle\Command;

use Exception;
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
            ->addOption('ignore', 'i', InputOption::VALUE_OPTIONAL|InputOption::VALUE_IS_ARRAY, 'Ignore rules', [])
        ;
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|void|null
     * @throws Exception
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);
        $io->title("Conventions check");

        $path = $input->getOption('path');
        $ignore = $input->getOption('ignore');

        if (empty($path)) {
            throw new Exception("Path not found.");
        }

        $convention = (new Conventions($path, $ignore))->scan()->showErrors($io);

        if ($convention->hasError()) {
            exit(1);
        }

        $io->success("No convention violations found :D");
    }
}
