<?php

namespace WhereGroup\CoreBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Console\Input\InputOption;
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
            ->setName('metador:taskmanager:run')
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'Ignore lock!', null)
            ->addOption('token', 't', InputOption::VALUE_OPTIONAL, 'Run task with same token.', null)
        ;
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fs = new Filesystem();
        $filePath = $this->getContainer()->get("kernel")->getRootDir() . '/../var/temp/TASKMANAGER.LOCK';

        if (!$input->getOption('force') && $fs->exists($filePath)) {
            $output->writeln("Taskmanager is locked");
            $this->log('error', 'Taskmanager kann nicht gestartet werden.');
            exit -1;
        }

        $fs->touch($filePath);

        try {
            $em = $this->getContainer()->get('doctrine')->getManager();
            $em->clear();
            $em->getConnection()->getConfiguration()->setSQLLogger(null);
            gc_collect_cycles();

            $event = new TaskManagerEvent($input, $output);

            if (!empty($input->getOption('token'))) {
                $event->setToken($input->getOption('token'));
            }

            $this->getContainer()->get('event_dispatcher')->dispatch('metador.taskmanager', $event);

            foreach ($event->getMessages() as $message) {
                $this->log('info', $message);
            }
        } catch (\Exception $e) {
            $this->log('error', $e->getMessage());
        }

        $fs->remove($filePath);
    }

    /**
     * @param $type
     * @param $message
     */
    private function log($type, $message)
    {
        $log = $this->getContainer()->get('metador_logger')->newLog();
        $log->setType($type)
            ->setCategory('system')
            ->setSubcategory('taskmanager')
            ->setOperation('start')
            ->setMessage($message)
            ->setUsername('')
        ;
        $this->getContainer()->get('metador_logger')->set($log);
    }
}
