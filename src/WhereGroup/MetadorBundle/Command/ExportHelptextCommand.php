<?php

namespace WhereGroup\MetadorBundle\Command;

use WhereGroup\MetadorBundle\Entity\Helptext;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\GetSetMethodNormalizer;

class ExportHelptextCommand extends ContainerAwareCommand {
    protected function configure() {
        $this->setDefinition(array(
            new InputOption('file', 'f', InputOption::VALUE_REQUIRED, 
                "Path to filename."
            ))
        )
        ->setDescription('Export helptext.')
        ->setHelp('Export helptext.')
        ->setName('metador:export:helptext');
    }

    protected function execute(InputInterface $input, OutputInterface $output) {
        $exportData = array();

        $filename = $input->getOption('file');

        if(empty($filename))
            throw new \RuntimeException("File wurde nicht angegeben!");
        

        $serializer = new Serializer(
            array(new GetSetMethodNormalizer()), 
            array(new JsonEncoder())
        );

        $helptexts = $this
            ->getContainer()
            ->get('doctrine')
            ->getRepository('WhereGroupMetadorBundle:Helptext')
            ->findAll();

        foreach($helptexts as $helptext) {
            $exportData[] = $serializer->serialize($helptext, 'json');
        }

        file_put_contents($filename, json_encode($exportData));

        $output->writeln('File saved to "' . $filename . '".');
    }
}