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
 * Class ImportHelptextCommand
 * @package WhereGroup\CoreBundle\Command
 * @author A. R. Pour
 */
class ImportHelptextCommand extends ContainerAwareCommand
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
        ->setDescription('Import helptext.')
        ->setHelp('Import helptext.')
        ->setName('metador:import:helptext');
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
        $filename = $input->getOption('file');

        if (empty($filename)) {
            throw new \RuntimeException("File wurde nicht angegeben!");
        }

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

        foreach ($helptexts as $helptext) {
            $newHelptext = $serializer->deserialize(
                $helptext,
                'Plugins\WhereGroup\HelptextBundle\Entity\Helptext',
                'json'
            );

            $existingHelptext = $this
                ->getContainer()
                ->get('doctrine')
                ->getRepository('MetadorHelptextBundle:Helptext')
                ->findById(
                    $newHelptext->getId()
                );

            if ($existingHelptext) {
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

        return 0;
    }
}
