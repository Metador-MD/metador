<?php

namespace WhereGroup\MetadorBundle\Component;

use Doctrine\ORM\QueryBuilder;
use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\MetadorBundle\Entity\Address as EntityAddress;

/**
 * Class Address
 * @package WhereGroup\MetadorBundle\Component
 * @author A. R. Pour
 */
class Address implements AddressInterface
{
    protected $container;

    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * @return mixed
     */
    public function get()
    {
        $address = $this->container->get('doctrine')
            ->getManager()
            ->createQueryBuilder('y')
            ->select('y.id, y.individualName')
            ->from('WhereGroupMetadorBundle:Address', 'y')
            ->getQuery()
            ->getResult();

        return $address;
    }

    /**
     * @param $metadataObject
     */
    public function set($metadataObject)
    {
        // SAVE NEW ADDRESSES
        $addresses = array_merge(
            isset($metadataObject['responsiblePartyMetadata'])
            ? $metadataObject['responsiblePartyMetadata'] : array(),
            isset($metadataObject['responsibleParty'])
            ? $metadataObject['responsibleParty'] : array(),
            isset($metadataObject['responsiblePartyDistributor'])
            ? $metadataObject['responsiblePartyDistributor'] : array()
        );

        foreach ($addresses as $row) {
            if (trim(@$row['organisationName']) == ""
                || trim(@$row['individualName']) == ""
                || trim(@$row['electronicMailAddress']) == ""
            ) {
                continue;
            }

            /** @var QueryBuilder $qb */
            $qb = $this->container->get('doctrine')->getManager()->createQueryBuilder();
            $em = $this->container->get('doctrine')->getManager();

            $result = $qb
                ->select('count(u)')
                ->from('WhereGroup\MetadorBundle\Entity\Address', 'u')
                ->where($qb->expr()->andx(
                    $qb->expr()->eq('u.organisationName', '?1'),
                    $qb->expr()->eq('u.individualName', '?2'),
                    $qb->expr()->eq('u.electronicMailAddress', '?3')
                ))->setParameters(array(
                    1 => $row['organisationName'],
                    2 => $row['individualName'],
                    3 => $row['electronicMailAddress']
                ))->getQuery()->getSingleScalarResult();

            if ($result == 0) {
                $address = new EntityAddress();
                $address->setOrganisationName(@$row['organisationName']);
                $address->setElectronicMailAddress(@$row['electronicMailAddress']);
                $address->setRole(is_null(@$row['role']) ? '' : $row['role']);
                $address->setIndividualName(@$row['individualName']);
                $address->setCountry(@$row['country']);
                $address->setAdministrativeArea(@$row['administrativeArea']);
                $address->setDeliveryPoint(@$row['deliveryPoint']);
                $address->setCity(@$row['city']);
                $address->setPostalCode(@$row['postalCode']);
                $address->setVoice(@$row['voice']);
                $address->setFacsimile(@$row['facsimile']);
                $address->setOnlineResource(@$row['onlineResource']);
                $address->setPositionName(@$row['positionName']);

                $em->persist($address);
                $em->flush();
                unset($address, $result);
            }
        }
    }
}
