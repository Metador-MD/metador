<?php

namespace WhereGroup\MapBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Description of Map
 *
 * @author Paul Schmidt<panadium@gmx.de>
 * @ ORM\Table(name="map")
 * @ ORM\Entity
 * @ ORM\Entity(repositoryClass="WhereGroup\MapBundle\Entity\MapRepository")
 */
class Map
{
    
    /**
     * @var integer $id an id
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @var string $crs a crs name
     * @ORM\Column(type="string", nullable=true)
     */
    protected $crs;

    /**
     * @var array $crsList a list of supported crses
     * @ORM\Column(type="string", nullable=true)
     */
    protected $crsList;

    /**
     * @var array $startBbox a source title
     * @ORM\Column(type="string",nullable=false)
     */
    protected $startBbox;

    /**
     * @var array $startBbox a source title
     * @ORM\Column(type="string",nullable=false)
     */
    protected $maxBbox;

    /**
     * @var \Doctrine\Common\Collections\ArrayCollection $wmsList available wmses
     * @ORM\OneToMany(targetEntity="Wms", mappedBy="map", cascade={"remove"})
     * @ORM\JoinColumn(name="wmsList", referencedColumnName="id")
     * @ORM\OrderBy({"priority" = "asc"})
     */
    protected $wmsList;
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->wmsList = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set crs
     *
     * @param string $crs
     * @return Map
     */
    public function setCrs($crs)
    {
        $this->crs = $crs;

        return $this;
    }

    /**
     * Get crs
     *
     * @return string 
     */
    public function getCrs()
    {
        return $this->crs;
    }

    /**
     * Set crsList
     *
     * @param string $crsList
     * @return Map
     */
    public function setCrsList($crsList)
    {
        $this->crsList = $crsList;

        return $this;
    }

    /**
     * Get crsList
     *
     * @return string 
     */
    public function getCrsList()
    {
        return $this->crsList;
    }

    /**
     * Set startBbox
     *
     * @param string $startBbox
     * @return Map
     */
    public function setStartBbox($startBbox)
    {
        $this->startBbox = $startBbox;

        return $this;
    }

    /**
     * Get startBbox
     *
     * @return string 
     */
    public function getStartBbox()
    {
        return $this->startBbox;
    }

    /**
     * Set maxBbox
     *
     * @param string $maxBbox
     * @return Map
     */
    public function setMaxBbox($maxBbox)
    {
        $this->maxBbox = $maxBbox;

        return $this;
    }

    /**
     * Get maxBbox
     *
     * @return string 
     */
    public function getMaxBbox()
    {
        return $this->maxBbox;
    }

    /**
     * Add wmsList
     *
     * @param \WhereGroup\CoreBundle\Entity\Wms $wmsList
     * @return Map
     */
    public function addWmsList(\WhereGroup\CoreBundle\Entity\Wms $wmsList)
    {
        $this->wmsList[] = $wmsList;

        return $this;
    }

    /**
     * Remove wmsList
     *
     * @param \WhereGroup\CoreBundle\Entity\Wms $wmsList
     */
    public function removeWmsList(\WhereGroup\CoreBundle\Entity\Wms $wmsList)
    {
        $this->wmsList->removeElement($wmsList);
    }

    /**
     * Get wmsList
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getWmsList()
    {
        return $this->wmsList;
    }
}
