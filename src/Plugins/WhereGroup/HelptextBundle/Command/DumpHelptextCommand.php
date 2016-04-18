<?php

namespace Plugins\WhereGroup\HelptextBundle\Command;

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
class DumpHelptextCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setDefinition(
            array()
        )
        ->setDescription('Export helptext into twig file.')
        ->setHelp('Export helptext.')
        ->setName('metador:dump:helptext');
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
        $array = "";

        $filename = __DIR__ . '/../Resources/views/dump.html.twig';

        $rows = $this
            ->getContainer()
            ->get('doctrine')
            ->getRepository('WhereGroupHelptextBundle:Helptext')
            ->findAll();

        foreach ($rows as $row) {
            $array[trim($row->getText())] = true;
        }

        $data = "";

        foreach (array_keys($array) as $string) {
            $data .= "{{ '" . $string . "'|trans }}\n";
        }

        file_put_contents($filename, $data);

        $output->writeln('File saved to "' . $filename . '".');

        return 0;
    }
}
