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

class ImportHelptextCommand extends ContainerAwareCommand {
    protected function configure() {
        $this->setDefinition(array(
            new InputOption('file', 'f', InputOption::VALUE_REQUIRED, 
                "Path to filename."
            ))
        )
        ->setDescription('Export helptext.')
        ->setHelp('Export helptext.')
        ->setName('metador:import:helptext');
    }

    protected function execute(InputInterface $input, OutputInterface $output) {
        $filename = $input->getOption('file');

        if(empty($filename))
            throw new \RuntimeException("File wurde nicht angegeben!");

        // TODO: file_exists readable etc.
        $serializer = new Serializer(
            array(new GetSetMethodNormalizer()), 
            array(new JsonEncoder())
        );

        $helptexts = json_decode(file_get_contents($filename));

        $em = $this
            ->getContainer()
            ->get('doctrine')
            ->getManager();
        
        foreach($helptexts as $helptext) {
            $newHelptext = $serializer->deserialize(
                $helptext, 'WhereGroup\MetadorBundle\Entity\Helptext', 'json'
            );

            $existingHelptext = $this
                ->getContainer()
                ->get('doctrine')
                ->getRepository('WhereGroupMetadorBundle:Helptext')
                ->findById(
                    $newHelptext->getId()
                );

            if($existingHelptext) {
                $existingHelptext[0]->setText(
                    $newHelptext->getText()
                );
                $em->persist($existingHelptext[0]);
            } else {
                $em->persist($newHelptext);
            }
        }

        $em->flush();

        $output->writeln('Import done.');
    }
}