<?php

namespace WhereGroup\CoreBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
use WhereGroup\CoreBundle\Event\TaskManagerEvent;

/**
 * Class TaskManagerCommand
 * @package WhereGroup\CoreBundle\Command
 */
class TaskManagerCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this
            ->setDescription('Runs the Taskmanager')
            ->setName('metador:taskmanager-run')
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'Ignore lock!', null)
            ->addArgument('username', InputArgument::REQUIRED, 'The username of the user.');
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $user     = $this->getContainer()->get('metador_user')->getByUsername($input->getArgument('username'));
        if ($user === null) {
            $output->writeln("<error>Anwender wurde nicht gefunden!</error>");
            return 128;
        }

        $fs       = new Filesystem();
        $fileName = 'TASKMANAGER_LOCK.LOCK';
        $basePath = $this->getContainer()->get("kernel")->getRootDir();
        $filePath = $basePath.'/../var/config/'.$fileName;

        $event    = new TaskManagerEvent($user);
        $forced   = $input->getOption('force');

        if ($forced || !$fs->exists($filePath)) {
            $fs->touch($filePath);
            $this->getContainer()->get('event_dispatcher')->dispatch('metador.taskmanager', $event);
            $fs->remove($filePath);
        }

        foreach ($event->getMessages() as $message) {
            $output->writeln($message);
        }

    }
}
