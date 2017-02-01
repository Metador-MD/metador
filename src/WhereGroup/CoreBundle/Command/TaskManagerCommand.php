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

        $fs       = new Filesystem();
        $fileName = 'TASKMANAGER_LOCK.LOCK';
        $basePath = $this->getContainer()->get("kernel")->getRootDir();
        $filePath = $basePath.'/../var/config/'.$fileName;

        $user     = $this->getContainer()->get('metador_user')->getByUsername($input->getArgument('username'));
        $event    = new TaskManagerEvent($user);
        $forced   = $input->getOption('force');

        if ($forced || !$fs->exists($filePath)) {
            $event->addMessage($event->__toString() . ($forced? ' forced ' : '') . " run");
            $fs->touch($filePath);
            $this->getContainer()->get('event_dispatcher')->dispatch('metador.taskmanager', $event);
            $fs->remove($filePath);
        }

        foreach ($event->getMessages() as $message) {
            $output->writeln($message);
        }

    }
}