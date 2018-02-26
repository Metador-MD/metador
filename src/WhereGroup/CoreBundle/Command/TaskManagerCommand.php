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
            ->setName('metador:taskmanager:run')
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'Ignore lock!', null)
        ;
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        try {
            $this->log('info', 'Aufgaben werden ausgeführt.');
            $event = new TaskManagerEvent();

            $fs = new Filesystem();
            $filePath = $this->getContainer()->get("kernel")->getRootDir() . '/../var/config/TASKMANAGER.LOCK';

            if (!$input->getOption('force') && $fs->exists($filePath)) {
                $this->log('error', 'Taskmanager kann nicht gestartet werden.');
                exit -1;
            }

            $fs->touch($filePath);
            $this->getContainer()->get('event_dispatcher')->dispatch('metador.taskmanager', $event);
            $fs->remove($filePath);

            foreach ($event->getMessages() as $message) {
                $output->writeln($message);
            }
        } catch (\Exception $e) {
            $this->log('error', $e->getMessage());
        }
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
