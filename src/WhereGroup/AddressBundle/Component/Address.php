<?php

namespace WhereGroup\AddressBundle\Component;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
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
    /** @var \Doctrine\Common\Persistence\ObjectRepository
     * |null
     * |\Plugins\WhereGroup\AddressBundle\Entity\AddressRepository  */
    protected $repo = null;

    /** @var EventDispatcherInterface */
    protected $eventDispatcher;


    const ENTITY = "MetadorAddressBundle:Address";

    /**
     * @param EntityManagerInterface $em
     * @param EventDispatcherInterface $eventDispatcher
     */
    public function __construct(EntityManagerInterface $em, EventDispatcherInterface $eventDispatcher)
    {
        $this->repo = $em->getRepository(self::ENTITY);
        $this->eventDispatcher = $eventDispatcher;
    }

    public function __destruct()
    {
        unset($this->repo, $this->eventDispatcher);
    }

    /**
     * @param $id
     * @return
     */
    public function get($id)
    {
        return $this->repo->findOneById($id);
    }

    /**
     * @return array|\Plugins\WhereGroup\AddressBundle\Entity\Address[]
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
     * @throws NoResultException
     */
    public function search($terms, $page = 1, $hits = 10)
    {
        $paging = new Paging($this->repo->search($terms, $page, $hits, true), $hits, $page);

        return [
            'paging' => $paging->calculate(),
            'rows'   => $this->repo->search($terms, $page, $hits),
        ];
    }

    /**
     * @return mixed
     * @throws NonUniqueResultException
     */
    public function count()
    {
        try {
            return $this->repo->countAll();
        } catch (NoResultException $e) {
            return 0;
        }
    }

    /**
     * @param \Plugins\WhereGroup\AddressBundle\Entity\Address $entity
     * @return $this
     * @throws MetadorException
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function save($entity)
    {
        $uuid = $this->generateUuid($entity);

        $event  = new AddressChangeEvent($entity, array(
            'oldUuid' => $entity->getUuid(),
            'newUuid' => $uuid
        ));

        $entity->setUuid($uuid);

        if ($this->repo->findOneByUuid($uuid)) {
            throw new MetadorException('Adresse existiert bereits');
        }

        $entity->setSearchfield(strtolower(
            $entity->getIndividualName()
            . ' ' . $entity->getOrganisationName()
            . ' ' . $entity->getCountry()
        ));

        $this->eventDispatcher->dispatch('address.post_save', $event);
        $this->repo->save($entity);
        $this->eventDispatcher->dispatch('address.post_save', $event);

        return $this;
    }

    /**
     * @param $entity
     * @return $this
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function remove($entity)
    {
        $event  = new AddressChangeEvent($entity, array());
        $this->eventDispatcher->dispatch('address.pre_delete', $event);

        $this->repo->remove($entity);

        return $this;
    }

    /**
     * @param \Plugins\WhereGroup\AddressBundle\Entity\Address $entity
     * @return mixed
     */
    public function generateUuid($entity)
    {
        $string = preg_replace('/\W/', '', strtolower(
            $entity->getIndividualName()
            . $entity->getOrganisationName()
            . $entity->getPositionName()
            . $entity->getEmail()
            . $entity->getCountry()
            . $entity->getAdministrativeArea()
            . $entity->getDeliveryPoint()
            . $entity->getCity()
            . $entity->getPostalCode()
            . $entity->getVoice()
            . $entity->getFacsimile()
            . $entity->getUrl()
            . $entity->getUrlDescription()
            . $entity->getHoursOfService()
        ));

        $uuid5 = Uuid::uuid5(Uuid::NAMESPACE_DNS, $string);

        return $uuid5->toString();
    }

    /**
     * @param $array
     * @return string
     */
    public function generateUuidFromArray($array)
    {
        $uuid5 = Uuid::uuid5(Uuid::NAMESPACE_DNS, preg_replace('/\W/', '', strtolower(
            (isset($array['organisationName']) ? $array['organisationName'] : '')
            . (isset($array['individualName']) ? $array['individualName'] : '')
            . (isset($array['positionName']) ? $array['positionName'] : '')
            . (isset($array['country']) ? $array['country'] : '')
            . (isset($array['administrativeArea']) ? $array['administrativeArea'] : '')
            . (isset($array['deliveryPoint']) ? $array['deliveryPoint'] : '')
            . (isset($array['city']) ? $array['city'] : '')
            . (isset($array['postalCode']) ? $array['postalCode'] : '')
            . (isset($array['voice']) ? $array['voice'] : '')
            . (isset($array['facsimile']) ? $array['facsimile'] : '')
            . (isset($array['url']) ? $array['url'] : '')
            . (isset($array['urlDescription']) ? $array['urlDescription'] : '')
            . (isset($array['hoursOfService']) ? $array['hoursOfService'] : '')
            . (isset($array['email']) && is_array($array['email']) ? implode('', $array['email']) : '')
        )));

        return $uuid5->toString();
    }
}
