<?php

namespace WhereGroup\AddressBundle\Component;

use Doctrine\Common\Persistence\ObjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use WhereGroup\AddressBundle\Event\AddressChangeEvent;
use Ramsey\Uuid\Uuid;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;
use WhereGroup\CoreBundle\Component\Search\Paging;

/**
 * Class Address
 * @package WhereGroup\AddressBundle\Component
 */
class Address
{
    /** @var ObjectRepository
     * |null
     * |\Plugins\WhereGroup\AddressBundle\Entity\AddressRepository  */
    protected $repo = null;

    /** @var EventDispatcherInterface */
    protected $eventDispatcher;

    /**
     * @var EntityManagerInterface
     */
    protected $em;

    const ENTITY = "MetadorAddressBundle:Address";

    protected $addressArray = [
        'organisationName',
        'individualName',
        'country',
        'administrativeArea',
        'deliveryPoint',
        'city',
        'postalCode',
        'voice',
        'facsimile',
        'url',
        'urlDescription',
        'email',
    ];

    /**
     * @param EntityManagerInterface $em
     * @param EventDispatcherInterface $eventDispatcher
     */
    public function __construct(EntityManagerInterface $em, EventDispatcherInterface $eventDispatcher)
    {
        $this->em = $em;
        $this->repo = $em->getRepository(self::ENTITY);
        $this->eventDispatcher = $eventDispatcher;
    }

    /**
     * @return EntityManagerInterface
     */
    public function getManager()
    {
        return $this->em;
    }

    public function __destruct()
    {
        unset($this->repo, $this->eventDispatcher);
    }

    /**
     * @param $id
     * @return \WhereGroup\AddressBundle\Entity\Address
     */
    public function get($id)
    {
        return $this->repo->findOneById($id);
    }

    /**
     * @param $uuid
     * @return mixed
     */
    public function getByUuid($uuid)
    {
        return $this->repo->findOneByUuid($uuid);
    }

    /**
     * @return array|\WhereGroup\AddressBundle\Entity\Address[]
     */
    public function all()
    {
        return $this->repo->findAll();
    }

    /**
     * @param $terms
     * @param int $page
     * @param int $hits
     * @return array
     * @throws NonUniqueResultException
     */
    public function search($terms, $page = 1, $hits = 10)
    {
        $result = [];
        $count = $this->repo->search($terms, $page, $hits, true);
        $paging = new Paging($count, $hits, $page);

        if ($count > 0) {
            $result = $this->repo->search($terms, $page, $hits);
        }

        return [
            'paging' => $paging->calculate(),
            'rows' => $result,
        ];
    }

    /**
     * @return mixed
     * @throws NonUniqueResultException
     */
    public function count()
    {
        return $this->repo->countAll();
    }

    /**
     * @param array $array
     * @param bool $flush
     * @return \WhereGroup\AddressBundle\Entity\Address
     * @throws MetadorException
     */
    public function saveArray(array $array, $flush = true)
    {
        if (isset($array['email']) && is_array($array['email'])) {
            $array['email'] = implode(',', $array['email']);
        }

        $address = new \WhereGroup\AddressBundle\Entity\Address();
        $address
            ->setOrganisationName(isset($array['organisationName']) ? $array['organisationName'] : '')
            ->setIndividualName(isset($array['individualName']) ? $array['individualName'] : '')
            ->setPositionName(isset($array['positionName']) ? $array['positionName'] : '')
            ->setDeliveryPoint(isset($array['deliveryPoint']) ? $array['deliveryPoint'] : '')
            ->setDepartment(isset($array['department']) ? $array['department'] : '')
            ->setPostalCode(isset($array['postalCode']) ? $array['postalCode'] : '')
            ->setCountry(isset($array['country']) ? $array['country'] : '')
            ->setAdministrativeArea(isset($array['administrativeArea']) ? $array['administrativeArea'] : '')
            ->setCity(isset($array['city']) ? $array['city'] : '')
            ->setVoice(isset($array['voice']) ? $array['voice'] : '')
            ->setFacsimile(isset($array['facsimile']) ? $array['facsimile'] : '')
            ->setEmail(isset($array['email']) ? $array['email'] : '')
            ->setUrl(isset($array['url']) ? $array['url'] : '')
            ->setUrlDescription(isset($array['urlDescription']) ? $array['urlDescription'] : '')
            ->setHoursOfService(isset($array['hoursOfService']) ? $array['hoursOfService'] : '');

        return $this->save($address, $flush);
    }

    /**
     * @param \WhereGroup\AddressBundle\Entity\Address $entity
     * @param bool $flush
     * @return \WhereGroup\AddressBundle\Entity\Address
     * @throws MetadorException
     */
    public function save($entity, $flush = true)
    {
        $uuid = $this->generateUuid($entity);
        $event = new AddressChangeEvent($entity, [
            'oldUuid' => $entity->getUuid()
        ]);

        $entity->setUuid($uuid);
        $existingEntity = $this->repo->findOneByUuid($uuid);

        if ($existingEntity && $existingEntity->getId() != $entity->getId()) {
            throw new MetadorException('Adresse existiert bereits');
        }

        $entity->setSearchfield(strtolower(
            $entity->getIndividualName()
            . ' ' . $entity->getOrganisationName()
            . ' ' . $entity->getCountry()
            . ' ' . $entity->getCity()
        ));

        $this->eventDispatcher->dispatch('address.pre_save', $event);
        $this->em->persist($entity);
        if ($flush) {
            $this->em->flush();
        }
        $this->eventDispatcher->dispatch('address.post_save', $event);

        return $entity;
    }

    /**
     * @param $entity
     * @return $this
     * @throws ORMException
     * @throws OptimisticLockException
     */
    public function remove($entity)
    {
        $event = new AddressChangeEvent($entity, []);
        $this->eventDispatcher->dispatch('address.pre_delete', $event);
        $this->repo->remove($entity);

        return $this;
    }

    /**
     * @param \WhereGroup\AddressBundle\Entity\Address $entity
     * @return mixed
     */
    public function generateUuid($entity)
    {
        return $this->generateUuidFromArray([
            'organisationName' => (!empty($entity->getOrganisationName()) ? $entity->getOrganisationName() : ''),
            'individualName' => (!empty($entity->getIndividualName()) ? $entity->getIndividualName() : ''),
            'positionName' => (!empty($entity->getPositionName()) ? $entity->getPositionName() : ''),
            'country' => (!empty($entity->getCountry()) ? $entity->getCountry() : ''),
            'administrativeArea' => (!empty($entity->getAdministrativeArea()) ? $entity->getAdministrativeArea() : ''),
            'deliveryPoint' => (!empty($entity->getDeliveryPoint()) ? $entity->getDeliveryPoint() : ''),
            'city' => (!empty($entity->getCity()) ? $entity->getCity() : ''),
            'postalCode' => (!empty($entity->getPostalCode()) ? $entity->getPostalCode() : ''),
            'voice' => (!empty($entity->getVoice()) ? $entity->getVoice() : ''),
            'facsimile' => (!empty($entity->getFacsimile()) ? $entity->getFacsimile() : ''),
            'url' => (!empty($entity->getUrl()) ? $entity->getUrl() : ''),
            'urlDescription' => (!empty($entity->getUrlDescription()) ? $entity->getUrlDescription() : ''),
            'hoursOfService' => (!empty($entity->getHoursOfService()) ? $entity->getHoursOfService() : ''),
            'email' => (!empty($entity->getEmail()) ? explode(',', $entity->getEmail()) : '')
        ]);
    }

    /**
     * @param $array
     * @return string
     */
    public function generateUuidFromArray($array)
    {
        $string = '';

        foreach ($this->addressArray as $key) {
            if (isset($array[$key]) && is_string($array[$key])) {
                $string .= empty($array[$key]) ? '' : trim($array[$key]);
            } elseif (isset($array[$key]) && is_array($array[$key])) {
                foreach ($array[$key] as $arrValue) {
                    $string .= trim($arrValue);
                }
            }
        }

        $uuid5 = Uuid::uuid5(Uuid::NAMESPACE_DNS, preg_replace('/\W/', '', strtolower($string)));

        return $uuid5->toString();
    }

    /**
     * @param \WhereGroup\AddressBundle\Entity\Address $entity
     * @return array
     */
    public function refreshArray($entity, array $address)
    {
        $this->setAttribute($address, 'id', $entity->getId());
        $this->setAttribute($address, 'uuid', $entity->getUuid());
        $this->setAttribute($address, 'organisationName', $entity->getOrganisationName());
        $this->setAttribute($address, 'individualName', $entity->getIndividualName());
        $this->setAttribute($address, 'positionName', $entity->getPositionName());
        $this->setAttribute($address, 'country', $entity->getCountry());
        $this->setAttribute($address, 'administrativeArea', $entity->getAdministrativeArea());
        $this->setAttribute($address, 'deliveryPoint', $entity->getDeliveryPoint());
        $this->setAttribute($address, 'city', $entity->getCity());
        $this->setAttribute($address, 'postalCode', $entity->getPostalCode());
        $this->setAttribute($address, 'voice', $entity->getVoice());
        $this->setAttribute($address, 'facsimile', $entity->getFacsimile());
        $this->setAttribute($address, 'url', $entity->getUrl());
        $this->setAttribute($address, 'urlDescription', $entity->getUrlDescription());
        $this->setAttribute($address, 'hoursOfService', $entity->getHoursOfService());
        $this->setAttribute($address, 'email', (!empty($entity->getEmail()) ? explode(',', $entity->getEmail()) : []));
        return $address;
    }

    /**
     * @param array $address
     * @param $key
     * @param $value
     * @return void
     */
    private function setAttribute(array &$address, $key, $value)
    {
        if ($value !== null) {
            $address[$key] = $value;
        }
        if ($value === null && isset($address[$key])) {
            unset($address[$key]);
        }
    }
}
