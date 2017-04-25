<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Description of Wms
 *
 * @author Paul Schmidt<panadium@gmx.de>
 * @ORM\Table(name="wms")
 * @ORM\Entity
 * @ORM\Entity(repositoryClass="WhereGroup\ThemeBundle\Entity\WmsRepository")
 */
class Wms
{
    static $type = "WMS";
    
    /**
     * @var integer $id
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;
    
    /**
     * @var string $gcUrl a WMS GetCapabilities URL
     * @ORM\Column(type="string", nullable=true)
     * @Assert\NotBlank()
     * @Assert\Url()
     */
    protected $gcUrl = "";

    /**
     * @var string $gmUrl a WMS GetMap URL
     * @ORM\Column(type="string", nullable=true)
     * @Assert\NotBlank()
     * @Assert\Url()
     */
    protected $gmUrl = "";

    /**
     * @var string $title a WMS title
     * @ORM\Column(type="string", nullable=true)
     */
    protected $title;

    /**
     * @var string $format an image format
     * @ORM\Column(type="string", nullable=false)
     */
    protected $format;

    /**
     * @var array $formatList a list of supported image formats
     * @ORM\Column(type="string", nullable=false)
     */
    protected $formatList = array();

    /**
     * @var string $version a WMS version
     * @ORM\Column(type="string", nullable=false)
     */
    protected $version;

    /**
     * @var string $opacity an opacity value
     * @ORM\Column(type="boolean", nullable=false)
     */
    protected $opacity = true;

    /**
     * @var \WhereGroup\CoreBundle\Entity\Map $map a map
     * @ORM\ManyToOne(targetEntity="Map", inversedBy="wmslist", cascade={"refresh"})
     * @ORM\JoinColumn(name="wmslist", referencedColumnName="id")
     */
    protected $map;

    /**
     * @var integer $priority a priority value
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $priority;

    public function __construct()
    {
        $this->formatList = array();
        $this->opacity = 1;
        $this->proority = 0;
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
     * Set gcUrl
     *
     * @param string $gcUrl
     * @return Wms
     */
    public function setGcUrl($gcUrl)
    {
        $this->gcUrl = $gcUrl;

        return $this;
    }

    /**
     * Get gcUrl
     *
     * @return string 
     */
    public function getGcUrl()
    {
        return $this->gcUrl;
    }

    /**
     * Set gmUrl
     *
     * @param string $gmUrl
     * @return Wms
     */
    public function setGmUrl($gmUrl)
    {
        $this->gmUrl = $gmUrl;

        return $this;
    }

    /**
     * Get gmUrl
     *
     * @return string 
     */
    public function getGmUrl()
    {
        return $this->gmUrl;
    }

    /**
     * Set title
     *
     * @param string $title
     * @return Wms
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
     * Set format
     *
     * @param string $format
     * @return Wms
     */
    public function setFormat($format)
    {
        $this->format = $format;

        return $this;
    }

    /**
     * Get format
     *
     * @return string 
     */
    public function getFormat()
    {
        return $this->format;
    }

    /**
     * Set formatList
     *
     * @param string $formatList
     * @return Wms
     */
    public function setFormatList($formatList)
    {
        $this->formatList = $formatList;

        return $this;
    }

    /**
     * Get formatList
     *
     * @return string 
     */
    public function getFormatList()
    {
        return $this->formatList;
    }

    /**
     * Set version
     *
     * @param string $version
     * @return Wms
     */
    public function setVersion($version)
    {
        $this->version = $version;

        return $this;
    }

    /**
     * Get version
     *
     * @return string 
     */
    public function getVersion()
    {
        return $this->version;
    }

    /**
     * Set opacity
     *
     * @param boolean $opacity
     * @return Wms
     */
    public function setOpacity($opacity)
    {
        $this->opacity = $opacity;

        return $this;
    }

    /**
     * Get opacity
     *
     * @return boolean 
     */
    public function getOpacity()
    {
        return $this->opacity;
    }

    /**
     * Set priority
     *
     * @param integer $priority
     * @return Wms
     */
    public function setPriority($priority)
    {
        $this->priority = $priority;

        return $this;
    }

    /**
     * Get priority
     *
     * @return integer 
     */
    public function getPriority()
    {
        return $this->priority;
    }

    /**
     * Set map
     *
     * @param \WhereGroup\CoreBundle\Entity\Map $map
     * @return Wms
     */
    public function setMap(\WhereGroup\CoreBundle\Entity\Map $map = null)
    {
        $this->map = $map;

        return $this;
    }

    /**
     * Get map
     *
     * @return \WhereGroup\CoreBundle\Entity\Map 
     */
    public function getMap()
    {
        return $this->map;
    }
}
