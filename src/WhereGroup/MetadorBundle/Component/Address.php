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

                $address->setOrganisationName(
                    isset($row['organisationName']) && !empty($row['organisationName']) ? $row['organisationName'] : ""
                );
                $address->setElectronicMailAddress(
                    isset($row['electronicMailAddress']) && !empty($row['electronicMailAddress']) ? $row['electronicMailAddress'] : ""
                );
                $address->setRole(
                    isset($row['role']) && !empty($row['role']) ? $row['role'] : ""
                );
                $address->setIndividualName(
                    isset($row['individualName']) && !empty($row['individualName']) ? $row['individualName'] : ""
                );
                $address->setCountry(
                    isset($row['country']) && !empty($row['country']) ? $row['country'] : ""
                );
                $address->setAdministrativeArea(
                    isset($row['administrativeArea']) && !empty($row['administrativeArea']) ? $row['administrativeArea'] : ""
                );
                $address->setDeliveryPoint(
                    isset($row['deliveryPoint']) && !empty($row['deliveryPoint']) ? $row['deliveryPoint'] : ""
                );
                $address->setCity(
                    isset($row['city']) && !empty($row['city']) ? $row['city'] : ""
                );
                $address->setPostalCode(
                    isset($row['postalCode']) && !empty($row['postalCode']) ? $row['postalCode'] : ""
                );
                $address->setVoice(
                    isset($row['voice']) && !empty($row['voice']) ? $row['voice'] : ""
                );
                $address->setFacsimile(
                    isset($row['facsimile']) && !empty($row['facsimile']) ? $row['facsimile'] : ""
                );
                $address->setOnlineResource(
                    isset($row['onlineResource']) && !empty($row['onlineResource']) ? $row['onlineResource'] : ""
                );
                $address->setPositionName(
                    isset($row['positionName']) && !empty($row['positionName']) ? $row['positionName']: ""
                );

                $em->persist($address);
                $em->flush();
                unset($address, $result);
            }
        }
    }
}
