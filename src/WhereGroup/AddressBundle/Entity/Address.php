<?php

namespace WhereGroup\AddressBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use WhereGroup\CoreBundle\Entity\Metadata;

/**
 * WhereGroup\AddressBundle\Entity\Address
 *
 * @ORM\Table(name="address")
 * @ORM\Entity
 * @ORM\Entity(repositoryClass="WhereGroup\AddressBundle\Entity\AddressRepository")
 */
class Address
{
    /**
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id = null;

    /**
     * @ORM\Column(type="string", length=255, unique=true)
     */
    private $uuid = '';

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $individualName = '';

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $organisationName = '';

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $positionName = '';

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $email = '';

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $country = '';

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $administrativeArea = '';

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $deliveryPoint = '';

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $city = '';

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $postalCode = '';

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $voice = '';

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $facsimile = '';

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $url = '';

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $urlDescription = '';

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $hoursOfService = '';

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $searchfield = '';

    /**
     * @ORM\ManyToMany(targetEntity="WhereGroup\CoreBundle\Entity\Metadata", mappedBy="address")
     */
    protected $metadata;

    /**
     * Address constructor.
     */
    public function __construct()
    {
        $this->metadata = new ArrayCollection();
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set uuid
     *
     * @param string $uuid
     *
     * @return Address
     */
    public function setUuid($uuid)
    {
        $this->uuid = $uuid;

        return $this;
    }

    /**
     * Get uuid
     *
     * @return string
     */
    public function getUuid()
    {
        return $this->uuid;
    }

    /**
     * Set individualName
     *
     * @param string $individualName
     *
     * @return Address
     */
    public function setIndividualName($individualName)
    {
        $this->individualName = $individualName;

        return $this;
    }

    /**
     * Get individualName
     *
     * @return string
     */
    public function getIndividualName()
    {
        return $this->individualName;
    }

    /**
     * Set organisationName
     *
     * @param string $organisationName
     *
     * @return Address
     */
    public function setOrganisationName($organisationName)
    {
        $this->organisationName = $organisationName;

        return $this;
    }

    /**
     * Get organisationName
     *
     * @return string
     */
    public function getOrganisationName()
    {
        return $this->organisationName;
    }

    /**
     * Set positionName
     *
     * @param string $positionName
     *
     * @return Address
     */
    public function setPositionName($positionName)
    {
        $this->positionName = $positionName;

        return $this;
    }

    /**
     * Get positionName
     *
     * @return string
     */
    public function getPositionName()
    {
        return $this->positionName;
    }

    /**
     * Set email
     *
     * @param string $email
     *
     * @return Address
     */
    public function setEmail($email)
    {
        $this->email = $email;

        return $this;
    }

    /**
     * Get email
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set country
     *
     * @param string $country
     *
     * @return Address
     */
    public function setCountry($country)
    {
        $this->country = $country;

        return $this;
    }

    /**
     * Get country
     *
     * @return string
     */
    public function getCountry()
    {
        return $this->country;
    }

    /**
     * Set administrativeArea
     *
     * @param string $administrativeArea
     *
     * @return Address
     */
    public function setAdministrativeArea($administrativeArea)
    {
        $this->administrativeArea = $administrativeArea;

        return $this;
    }

    /**
     * Get administrativeArea
     *
     * @return string
     */
    public function getAdministrativeArea()
    {
        return $this->administrativeArea;
    }

    /**
     * Set deliveryPoint
     *
     * @param string $deliveryPoint
     *
     * @return Address
     */
    public function setDeliveryPoint($deliveryPoint)
    {
        $this->deliveryPoint = $deliveryPoint;

        return $this;
    }

    /**
     * Get deliveryPoint
     *
     * @return string
     */
    public function getDeliveryPoint()
    {
        return $this->deliveryPoint;
    }

    /**
     * Set city
     *
     * @param string $city
     *
     * @return Address
     */
    public function setCity($city)
    {
        $this->city = $city;

        return $this;
    }

    /**
     * Get city
     *
     * @return string
     */
    public function getCity()
    {
        return $this->city;
    }

    /**
     * Set postalCode
     *
     * @param string $postalCode
     *
     * @return Address
     */
    public function setPostalCode($postalCode)
    {
        $this->postalCode = $postalCode;

        return $this;
    }

    /**
     * Get postalCode
     *
     * @return string
     */
    public function getPostalCode()
    {
        return $this->postalCode;
    }

    /**
     * Set voice
     *
     * @param string $voice
     *
     * @return Address
     */
    public function setVoice($voice)
    {
        $this->voice = $voice;

        return $this;
    }

    /**
     * Get voice
     *
     * @return string
     */
    public function getVoice()
    {
        return $this->voice;
    }

    /**
     * Set facsimile
     *
     * @param string $facsimile
     *
     * @return Address
     */
    public function setFacsimile($facsimile)
    {
        $this->facsimile = $facsimile;

        return $this;
    }

    /**
     * Get facsimile
     *
     * @return string
     */
    public function getFacsimile()
    {
        return $this->facsimile;
    }

    /**
     * Set url
     *
     * @param string $url
     *
     * @return Address
     */
    public function setUrl($url)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * Get url
     *
     * @return string
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * Set urlDescription
     *
     * @param string $urlDescription
     *
     * @return Address
     */
    public function setUrlDescription($urlDescription)
    {
        $this->urlDescription = $urlDescription;

        return $this;
    }

    /**
     * Get urlDescription
     *
     * @return string
     */
    public function getUrlDescription()
    {
        return $this->urlDescription;
    }

    /**
     * Set hoursOfService
     *
     * @param string $hoursOfService
     *
     * @return Address
     */
    public function setHoursOfService($hoursOfService)
    {
        $this->hoursOfService = $hoursOfService;

        return $this;
    }

    /**
     * Get hoursOfService
     *
     * @return string
     */
    public function getHoursOfService()
    {
        return $this->hoursOfService;
    }

    /**
     * Set searchfield
     *
     * @param string $searchfield
     *
     * @return Address
     */
    public function setSearchfield($searchfield)
    {
        $this->searchfield = $searchfield;

        return $this;
    }

    /**
     * Get searchfield
     *
     * @return string
     */
    public function getSearchfield()
    {
        return $this->searchfield;
    }

    /**
     * @param Metadata $metadata
     * @return $this
     */
    public function addMetadata(Metadata $metadata)
    {
        if (!$this->metadata->contains($metadata)) {
            $this->metadata[] = $metadata;
        }

        return $this;
    }

    /**
     * @param Metadata $metadata
     * @return Address
     */
    public function removeMetadata(Metadata $metadata)
    {
        $this->metadata->removeElement($metadata);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getMetadata()
    {
        return $this->metadata;
    }
}
