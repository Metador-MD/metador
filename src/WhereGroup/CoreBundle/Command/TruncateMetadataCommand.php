<?php

namespace WhereGroup\CoreBundle\Command;

use Doctrine\ORM\Mapping\Entity;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Style\SymfonyStyle;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;
use WhereGroup\CoreBundle\Service\Metadata\Metadata;

/**
 * Class TruncateMetadataCommand
 * @package WhereGroup\CoreBundle\Command
 */
class TruncateMetadataCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Truncates all Metadata')
            ->setName('metador:truncate:metadata');
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);

        if ($io->confirm("Metadaten löschen?", false)) {
            $this->getContainer()->get(Metadata::class)->db->getRepository()->truncate();
            $this->getContainer()->get(Metadata::class)->db->dispatchPostTruncate(
                new MetadataChangeEvent(new Entity(), [])
            );
            $io->success("Alle Metadaten wurde erfolgreich gelöscht.");
        }
    }
}
