<?php

namespace WhereGroup\CoreBundle\Command;

use SolrClientException;
use SolrServerException;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Style\SymfonyStyle;

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
     * @throws SolrClientException
     * @throws SolrServerException
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);

        if ($io->confirm("Metadaten löschen?", false)) {
            $this
                ->getContainer()
                ->get('doctrine')
                ->getRepository('MetadorCoreBundle:Metadata')
                ->truncate();

            // Todo: add truncate event dispatcher
            //$solr = $this->getContainer()->get('lvermgeo_solr');
//            if ($solr->isActive()) {
//                $solr->client->deleteByQuery('*:*');
//                $solr->client->commit();
//            }

            $io->success("Alle Metadaten wurde erfolgreich gelöscht.");
        }
    }
}
