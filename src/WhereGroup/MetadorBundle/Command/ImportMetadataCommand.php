<?php

namespace WhereGroup\MetadorBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;

/**
 * Class ImportMetadataCommand
 * @package WhereGroup\MetadorBundle\Command
 * @author A. R. Pour
 */
class ImportMetadataCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setDefinition(
            array(
                new InputOption(
                    'folder',
                    'f',
                    InputOption::VALUE_REQUIRED,
                    "Path to folder."
                )
            )
        )
        ->setDescription('Export metadata from folder.')
        ->setHelp('Export metadata from folder.')
        ->setName('metador:import:metadata');
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
        $path = $input->getOption('folder');

        if (empty($path)) {
            throw new \RuntimeException("Pfad zu Metadaten wurde nicht angegeben!");
        }

        $config = $this->getContainer()->getParameter('metador');
        $files = 0;

        $output->write('Import start... ');

        $finder = new Finder();
        $finder->files()->name('*.xml')->in($path);

        foreach ($finder as $file) {
            $object = $this->getContainer()->get('metadata_import')->load(
                file_get_contents($file->getRealpath()),
                $config
            );

            /** @var \WhereGroup\MetadorBundle\Component\Metadata $metadata */
            $metadata = $this->getContainer()->get('metador_metadata');
            $successful = $metadata->saveObject($object, false, 'root');

            if ($successful) {
                unlink($file->getRealpath());
                ++$files;
            }
        }

        $output->writeln('done.');
        $output->writeln('Added ' . $files . ' files!');

        return 0;
    }
}
