<?php

namespace WhereGroup\CoreBundle\Command;

use WhereGroup\CoreBundle\Entity\Helptext;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\GetSetMethodNormalizer;

/**
 * Class ExportHelptextCommand
 * @package WhereGroup\CoreBundle\Command
 * @author A. R. Pour
 */
class ExportHelptextCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setDefinition(
            array(
                new InputOption(
                    'file',
                    'f',
                    InputOption::VALUE_REQUIRED,
                    "Path to filename."
                )
            )
        )
        ->setDescription('Export helptext.')
        ->setHelp('Export helptext.')
        ->setName('metador:export:helptext');
    }

    /**
     * Executes the current command.
     *
     * This method is not abstract because you can use this class
     * as a concrete class. In this case, instead of defining the
     * execute() method, you set the code to execute by passing
     * a Closure to the setCode() method.
     *
     * @param InputInterface  $input  An InputInterface instance
     * @param OutputInterface $output An OutputInterface instance
     *
     * @return null|int     null or 0 if everything went fine, or an error code
     *
     * @throws \LogicException When this abstract method is not implemented
     * @see    setCode()
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $exportData = array();

        $filename = $input->getOption('file');

        if (empty($filename)) {
            throw new \RuntimeException("File wurde nicht angegeben!");
        }


        $serializer = new Serializer(
            array(new GetSetMethodNormalizer()),
            array(new JsonEncoder())
        );

        $helptexts = $this
            ->getContainer()
            ->get('doctrine')
            ->getRepository('WhereGroupCoreBundle:Helptext')
            ->findAll();

        foreach ($helptexts as $helptext) {
            $exportData[] = $serializer->serialize($helptext, 'json');
        }

        file_put_contents($filename, json_encode($exportData));

        $output->writeln('File saved to "' . $filename . '".');

        return 0;
    }
}
