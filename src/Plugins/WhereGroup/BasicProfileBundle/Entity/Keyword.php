<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * WhereGroup\CoreBundle\Entity\Keyword
 *
 * @ORM\Table(name="keyword")
 * @ORM\Entity
 * @ORM\Entity(repositoryClass="Plugins\WhereGroup\BasicProfileBundle\Entity\KeywordRepository")
 */
class Keyword
{
    /**
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id = null;

    /**
     * @ORM\Column(type="string", length=255, unique=true)
     * @Assert\NotBlank(message="Identifier darf nicht leer sein.")
     */
    private $identifier = null;

    /**
     * @ORM\Column(type="boolean", options={"default" : false})
     */
    private $repository = null;

    /**
     * @ORM\Column(type="string", length=255, unique=true)
     * @Assert\NotBlank(message="Titel darf nicht leer sein.")
     */
    private $title = null;

    /**
     * @ORM\Column(type="date")
     * @Assert\NotBlank(message="Datum darf nicht leer sein.")
     */
    private $date = null;

    /**
     * @ORM\Column(type="string", length=20)
     * @Assert\NotBlank(message="Datumstyp darf nicht leer sein.")
     */
    private $dateType = null;

    /**
     * @ORM\Column(type="json_array")
     */

    private $keywords = null;

    /**
     * @ORM\Column(type="json_array")
     */
    private $profiles = null;

    /**
     * Get id
     *
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set title
     *
     * @param string $title
     *
     * @return Keyword
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set date
     *
     * @param \DateTime $date
     *
     * @return Keyword
     */
    public function setDate($date)
    {
        $this->date = $date;

        return $this;
    }

    /**
     * Get date
     *
     * @return \DateTime
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * Set dateType
     *
     * @param string $dateType
     *
     * @return Keyword
     */
    public function setDateType($dateType)
    {
        $this->dateType = $dateType;

        return $this;
    }

    /**
     * Get dateType
     *
     * @return string
     */
    public function getDateType()
    {
        return $this->dateType;
    }

    /**
     * Set keywords
     *
     * @param string $keywords
     *
     * @return Keyword
     */
    public function setKeywords($keywords)
    {
        $this->keywords = $keywords;

        return $this;
    }

    /**
     * Get keywords
     *
     * @return string
     */
    public function getKeywords()
    {
        return $this->keywords;
    }

    /**
     * Set identifier
     *
     * @param string $identifier
     *
     * @return Keyword
     */
    public function setIdentifier($identifier)
    {
        $this->identifier = $identifier;

        return $this;
    }

    /**
     * Get identifier
     *
     * @return string
     */
    public function getIdentifier()
    {
        return $this->identifier;
    }

    /**
     * Set repository
     *
     * @param boolean $repository
     *
     * @return Keyword
     */
    public function setRepository($repository)
    {
        $this->repository = $repository;

        return $this;
    }

    /**
     * Get repository
     *
     * @return boolean
     */
    public function getRepository()
    {
        return $this->repository;
    }

    /**
     * Set profiles
     *
     * @param array $profiles
     *
     * @return Keyword
     */
    public function setProfiles($profiles)
    {
        $this->profiles = $profiles;

        return $this;
    }

    /**
     * Get profiles
     *
     * @return array
     */
    public function getProfiles()
    {
        return $this->profiles;
    }
}
