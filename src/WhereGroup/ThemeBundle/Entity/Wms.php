<?php

namespace WhereGroup\ThemeBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Description of Wms
 *
 * @author Paul Schmidt<panadium@gmx.de>
 * @ORM\Table(name="wms")
 * @ORM\Entity
 * @ ORM\Entity(repositoryClass="WhereGroup\ThemeBundle\Entity\WmsRepository")
 */
class Wms
{
    
    /**
     * @var integer $id
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;
    
    /**
     * @var string a WMS GetCapabilities URL
     * @ORM\Column(type="string", nullable=true)
     * @Assert\NotBlank()
     * @Assert\Url()
     */
    protected $gcurl = "";

    /**
     * @var string a WMS GetMap URL
     * @ORM\Column(type="string", nullable=true)
     * @Assert\NotBlank()
     * @Assert\Url()
     */
    protected $gmurl = "";

    /**
     * @var string $title The source title
     * @ORM\Column(type="string", nullable=true)
     */
    protected $title;

    /**
     * @ORM\Column(type="string", nullable=false)
     */
    protected $format;

    /**
     * @ORM\Column(type="string", nullable=false)
     */
    protected $formatList = array();

    /**
     * @ORM\Column(type="string", nullable=false)
     */
    protected $exception;
    /**
     * @ORM\Column(type="string", nullable=false)
     */
    protected $exceptionList = array();

    /**
     * @ORM\Column(type="boolean", nullable=false)
     */
    protected $opacity = true;

        /**
     * @ORM\ManyToOne(targetEntity="Map", inversedBy="wmslist", cascade={"refresh"})
     * @ORM\JoinColumn(name="wmsinstance", referencedColumnName="id")
     */
    protected $map;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $priority;

    public function __construct()
    {
        $this->formatList = array();
        $this->exceptionList = array();
        $this->opacity = 1;
        $this->proority = 0;
    }

    
}