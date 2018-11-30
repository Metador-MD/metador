<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\EventDispatcher\Event;
use WhereGroup\UserBundle\Component\UserInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Class TaskManagerEvent
 * @package WhereGroup\CoreBundle\Event
 */
class TaskManagerEvent extends Event
{
    /** @var  UserInterface $user */
    private $messages;
    public $input = null;
    public $output = null;
    public $io = null;

    /**
     * TaskManagerEvent constructor.
     * @param array $conf
     */
    public function __construct(array $conf = [])
    {
        $this->messages = array();

        if (isset($conf['input']) && $conf['input'] instanceof InputInterface) {
            $this->input = $conf['input'];
        }

        if (isset($conf['output']) && $conf['output'] instanceof OutputInterface) {
            $this->output = $conf['output'];
        }

        if (!is_null($this->input) && !is_null($this->output)) {
            $this->io = new SymfonyStyle($this->input, $this->output);
        }
    }

    /**
     * @param $message
     */
    public function addMessage($message)
    {
        $this->messages[] = $message;
    }

    /**
     * @return array
     */
    public function getMessages()
    {
        return $this->messages;
    }
}
