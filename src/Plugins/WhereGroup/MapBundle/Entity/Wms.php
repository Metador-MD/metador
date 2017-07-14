<?php

namespace Plugins\WhereGroup\MapBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Description of Wms
 *
 * @author Paul Schmidt<panadium@gmx.de>
 * @ORM\Table(name="wms")
 * @ORM\Entity
 * @ORM\Entity(repositoryClass="Plugins\WhereGroup\MapBundle\Entity\WmsRepository")
 */
class Wms
{

    const TITLE_DEFAULT = 'Nicht Definiert';

    public static $type = "WMS";

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
     * @Assert\Url()
     */
    protected $gmUrl = "";

    /**
     * @var string $title a WMS title
     * @ORM\Column(type="string", nullable=false)
     * @Assert\NotBlank(message="Der Titel darf nicht leer sein")
     */
    protected $title;

    /**
     * @var string $format an image format
     * @ORM\Column(type="string", nullable=false)
     */
    protected $format;

    /**
     * @var array $formats a list of supported image formats
     * @ORM\Column(type="array", nullable=false)
     */
    protected $formats = array();

    /**
     * @var array $layers selected layers
     * @ORM\Column(type="array", nullable=false)
     */
    protected $layers;

    /**
     * @var array $layerList all available layers
     * @ORM\Column(type="array", nullable=false)
     */
    protected $layerList = array();

    /**
     * @var string $version a WMS version
     * @ORM\Column(type="string", nullable=false)
     */
    protected $version;

    /**
     * @var boolean $visible a visible value
     * @ORM\Column(type="boolean", nullable=false)
     */
    protected $visible = true;

    /**
     * @var float $opacity an opacity value
     * @ORM\Column(type="float", nullable=false)
     */
    protected $opacity;

    /**
     * @var integer $priority a priority value
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $priority;

    public function __construct()
    {
        $this->formats = array();
        $this->layerList = array();
        $this->layers = array();
        $this->visible = true;
        $this->opacity = 1.0;
        $this->priority = 0;
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
     * Set layers
     *
     * @param array $layers
     * @return Wms
     */
    public function setLayers($layers)
    {
        $this->layers = $layers;

        return $this;
    }

    /**
     * Get layers
     *
     * @return array
     */
    public function getLayers()
    {
        return $this->layers;
    }

    /**
     * Set layerList
     *
     * @param array $layerList
     * @return Wms
     */
    public function setLayerList($layerList)
    {
        $this->layerList = $layerList;

        return $this;
    }

    /**
     * Add to layerList
     *
     * @param string $layer
     * @return Wms
     */
    public function addToLayerList($layer)
    {
        $this->layerList[] = $layer;

        return $this;
    }

    /**
     * Get layerList
     *
     * @return array
     */
    public function getLayerList()
    {
        return $this->layerList;
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
     * Set visible
     *
     * @param boolean $visible
     * @return Wms
     */
    public function setVisible($visible)
    {
        $this->visible = $visible;

        return $this;
    }

    /**
     * Get visible
     *
     * @return boolean
     */
    public function getVisible()
    {
        return $this->visible;
    }

    /**
     * Set opacity
     *
     * @param float $opacity
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
     * @return float
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
     * Set formats
     *
     * @param array $formats
     * @return Wms
     */
    public function setFormats($formats)
    {
        $this->formats = $formats;

        return $this;
    }

    /**
     * Get formats
     *
     * @return array
     */
    public function getFormats()
    {
        return $this->formats;
    }

    /**
     * Get formats
     *
     * @return array
     */
    public function addFormat($format)
    {
        $this->formats[] = $format;

        return $this;
    }
}
