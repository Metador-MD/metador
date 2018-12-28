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
            ->setName('metador:conventions')
            ->addOption('path', 'p', InputOption::VALUE_REQUIRED, 'Path to code', null)
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
        $path = $input->getOption('path');

        if (is_null($path)) {
            throw new \Exception("Path not found.");
        }

        $convention = (new Conventions($path))->scan()->showErrors(new SymfonyStyle($input, $output));

        if ($convention->hasError()) {
            exit(1);
        }
    }
}
