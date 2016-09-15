<?php

namespace Plugins\WhereGroup\AddressBundle\Component;

use Doctrine\ORM\QueryBuilder;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Plugins\WhereGroup\AddressBundle\Entity\Address as EntityAddress;

/**
 * Class Address
 * @package Plugins\WhereGroup\AddressBundle\Component
 * @author A.R.Pour
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
            ->from('MetadorAddressBundle:Address', 'y')
            ->getQuery()
            ->getResult();

        return $address;
    }

    /**
     * @param $metadataObject
     * @return $this
     */
    public function set($metadataObject)
    {
        foreach ($this->getAddresses($metadataObject) as $row) {
            if (!$this->conditionsComplied($row)) {
                continue;
            }

            if (!$this->addressExists($row)) {
                $address = new EntityAddress();

                $address->setOrganisationName(
                    isset($row['organisationName']) && !empty($row['organisationName']) ? $row['organisationName'] : ""
                );
                $address->setElectronicMailAddress(
                    isset($row['electronicMailAddress']) && !empty($row['electronicMailAddress'])
                        ? $row['electronicMailAddress']
                        : ""
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
                    isset($row['administrativeArea']) && !empty($row['administrativeArea'])
                        ? $row['administrativeArea']
                        : ""
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

                $this->save($address);

                unset($address, $result);
            }
        }

        return $this;
    }

    /**
     * @param $address
     * @return bool
     */
    protected function conditionsComplied($address)
    {
        if (!isset($address['organisationName']) || $address['organisationName'] == "" ||
            !isset($address['individualName']) || $address['individualName'] == "" ||
            !isset($address['electronicMailAddress']) || $address['electronicMailAddress'] == "") {
            return false;
        }

        return true;
    }

    /**
     * @param $metadataObject
     * @return array
     */
    protected function getAddresses($metadataObject)
    {
        return array_merge(
            isset($metadataObject['responsiblePartyMetadata'])
                ? $metadataObject['responsiblePartyMetadata'] : array(),
            isset($metadataObject['responsibleParty'])
                ? $metadataObject['responsibleParty'] : array(),
            isset($metadataObject['responsiblePartyDistributor'])
                ? $metadataObject['responsiblePartyDistributor'] : array()
        );
    }

    /**
     * @param $address
     * @return bool
     */
    protected function addressExists($address)
    {
        /** @var QueryBuilder $qb */
        $qb = $this->container->get('doctrine')->getManager()->createQueryBuilder();

        $result = $qb
            ->select('count(u)')
            ->from('Plugins\WhereGroup\AddressBundle\Entity\Address', 'u')
            ->where($qb->expr()->andx(
                $qb->expr()->eq('u.organisationName', '?1'),
                $qb->expr()->eq('u.individualName', '?2'),
                $qb->expr()->eq('u.electronicMailAddress', '?3')
            ))->setParameters(array(
                1 => $address['organisationName'],
                2 => $address['individualName'],
                3 => $address['electronicMailAddress']
            ))->getQuery()->getSingleScalarResult();

        return $result == 0 ? false : true;
    }

    /**
     * @param $address
     */
    protected function save($address)
    {
        $em = $this->container->get('doctrine')->getManager();
        $em->persist($address);
        $em->flush();
    }
}
