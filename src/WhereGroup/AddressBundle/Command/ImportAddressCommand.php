<?php

namespace WhereGroup\AddressBundle\Command;

use Plugins\WhereGroup\AddressBundle\Component\Address;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Console\Style\SymfonyStyle;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;
use \Plugins\WhereGroup\AddressBundle\Entity\Address as AddressEntity;

/**
 * Class ImportAddressCommand
 * @package WhereGroup\AddressBundle\Command
 */
class ImportAddressCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Imports addresses from file')
            ->setName('metador:import:address')
            ->addArgument('file', InputArgument::REQUIRED, 'File to dump in?')
        ;
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fs = new Filesystem();
        $io = new SymfonyStyle($input, $output);
        $io->title('Import Addresses');

        $file   = $input->getArgument('file');

        if (!$fs->exists($file) || !is_readable($file)) {
            $io->error('File not found.');
            return;
        }

        $rows = json_decode(file_get_contents($file), true);

        if (!$rows) {
            $io->error('No addresses found');
            return;
        }

        $address = $this->getContainer()->get('metador_address');
        $count   = 0;

        foreach ($rows as $row) {
            try {
                $entity = new AddressEntity();
                $entity
                    ->setIndividualName($row['individualName'])
                    ->setOrganisationName($row['organisationName'])
                    ->setPositionName($row['positionName'])
                    ->setEmail($row['email'])
                    ->setCountry($row['country'])
                    ->setAdministrativeArea($row['administrativeArea'])
                    ->setDeliveryPoint($row['deliveryPoint'])
                    ->setCity($row['city'])
                    ->setPostalCode($row['postalCode'])
                    ->setVoice($row['voice'])
                    ->setFacsimile($row['facsimile'])
                    ->setUrl($row['url'])
                    ->setUrlDescription($row['urlDescription'])
                    ->setHoursOfService($row['hoursOfService']);

                $address->save($entity);
                ++$count;
            } catch (MetadorException $e) {
                $io->error($e->getMessage());
            }
        }

        $io->success($count . " addresses imported.");
    }
}
