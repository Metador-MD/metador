<?php

namespace WhereGroup\ThemeBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Description of Wms
 *
 * @author Paul Schmidt<panadium@gmx.de>
 * @ORM\Table(name="map")
 * @ORM\Entity
 * @ ORM\Entity(repositoryClass="WhereGroup\ThemeBundle\Entity\MapRepository")
 */
class Map
{
    
    /**
     * @var integer $id
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @var string $uuid The unic id
     * @ORM\Column(type="string", nullable=true)
     * @ ORM\Column(type="string", length=36, nullable=false, unique=true)
     */
    protected $uuid;
    
    /**
     * @var string An origin WMS URL
     * @ORM\Column(type="string", nullable=true)
     * @Assert\NotBlank()
     * @Assert\Url()
     */
    protected $originUrl = "";

    /**
     * @var string $title The source title
     * @ORM\Column(type="string", nullable=true)
     */
    protected $title;

    /**
     * @ORM\Column(type="string",nullable=false)
     */
    protected $type;


    /**
     * @ORM\OneToMany(targetEntity="Wms", mappedBy="map", cascade={"remove"})
     * @ORM\JoinColumn(name="wmslist", referencedColumnName="id")
     * @ORM\OrderBy({"priority" = "asc"})
     */
    protected $wmslist;
}