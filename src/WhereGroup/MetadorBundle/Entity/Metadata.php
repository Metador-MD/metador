<?php
namespace WhereGroup\MetadorBundle\Entity;

use WhereGroup\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * WhereGroup\MetadorBundle\Entity\Metadata
 *
 * @ORM\Table(name="metador_metadata")
 * @ORM\Entity
 */
class Metadata
{
    /**
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     */
    private $insertTime;

    /**
     * @ORM\Column(type="integer")
     */    
    private $updateTime;

    /**
     * @ORM\ManyToOne(targetEntity="WhereGroup\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="insertuser_id", referencedColumnName="id")
     */
    private $insertUser;

    /**
     * @ORM\ManyToOne(targetEntity="WhereGroup\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="updateuser_id", referencedColumnName="id")
     */
    private $updateUser;

    /**
     * @ORM\Column(type="string", length=255, unique=true)
     */
    private $uuid;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $codespace;

    /**
     * @ORM\Column(type="string", length=32)
     */
    private $hierarchyLevel;

    /**
     * @ORM\Column(type="text")
     */
    private $title;
    
    /**
     * @ORM\Column(type="text")
     */
    private $abstract;

    /**
     * @ORM\Column(type="text")
     */
    private $searchfield;

    /**
     * @ORM\Column(type="text")
     */
    private $browserGraphic;

    /**
     * @ORM\Column(type="text")
     */
    private $metadata;

    /**
     * @ORM\Column(type="boolean")
     */
    private $public;

    /**
     * @ORM\Column(type="text")
     */
    private $groups;

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
     * Set insertTime
     *
     * @param integer $insertTime
     * @return Metadata
     */
    public function setInsertTime($insertTime)
    {
        $this->insertTime = $insertTime;
    
        return $this;
    }

    /**
     * Get insertTime
     *
     * @return integer 
     */
    public function getInsertTime()
    {
        return $this->insertTime;
    }

    /**
     * Set updateTime
     *
     * @param integer $updateTime
     * @return Metadata
     */
    public function setUpdateTime($updateTime)
    {
        $this->updateTime = $updateTime;
    
        return $this;
    }

    /**
     * Get updateTime
     *
     * @return integer 
     */
    public function getUpdateTime()
    {
        return $this->updateTime;
    }

    /**
     * Set uuid
     *
     * @param string $uuid
     * @return Metadata
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
     * Set codespace
     *
     * @param string $codespace
     * @return Metadata
     */
    public function setCodespace($codespace)
    {
        $this->codespace = $codespace;
    
        return $this;
    }

    /**
     * Get codespace
     *
     * @return string 
     */
    public function getCodespace()
    {
        return $this->codespace;
    }

    /**
     * Set title
     *
     * @param string $title
     * @return Metadata
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
     * Set abstract
     *
     * @param string $abstract
     * @return Metadata
     */
    public function setAbstract($abstract)
    {
        $this->abstract = $abstract;
    
        return $this;
    }

    /**
     * Get abstract
     *
     * @return string 
     */
    public function getAbstract()
    {
        return $this->abstract;
    }

    /**
     * Set searchfield
     *
     * @param string $searchfield
     * @return Metadata
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
     * Set browserGraphic
     *
     * @param string $browserGraphic
     * @return Metadata
     */
    public function setBrowserGraphic($browserGraphic)
    {
        $this->browserGraphic = $browserGraphic;
    
        return $this;
    }

    /**
     * Get browserGraphic
     *
     * @return string 
     */
    public function getBrowserGraphic()
    {
        return $this->browserGraphic;
    }

    /**
     * Set insertUser
     *
     * @param User $insertUser
     * @return Metadata
     */
    public function setInsertUser(User $insertUser = null)
    {
        $this->insertUser = $insertUser;
    
        return $this;
    }

    /**
     * Get insertUser
     *
     * @return User
     */
    public function getInsertUser()
    {
        return $this->insertUser;
    }

    /**
     * Set updateUser
     *
     * @param User $updateUser
     * @return Metadata
     */
    public function setUpdateUser(User $updateUser = null)
    {
        $this->updateUser = $updateUser;
    
        return $this;
    }

    /**
     * Get updateUser
     *
     * @return User
     */
    public function getUpdateUser()
    {
        return $this->updateUser;
    }

    /**
     * Get metadata
     *
     * @return string 
     */
    public function getMetadata()
    {
        return $this->metadata;
    }

    /**
     * Set metadata
     *
     * @param string $metadata
     * @return Metadata
     */
    public function setMetadata($metadata)
    {
        $this->metadata = $metadata;
        return $this;
    }

    /**
     * Get public
     *
     * @return boolean
     */
    public function getPublic()
    {
        return $this->public;
    }

    /**
     * Set public
     *
     * @param string $public
     * @return Metadata
     */
    public function setPublic($public)
    {
        $this->public = $public;
        return $this;
    }
    
    /**
     * Get hierarchyLevel
     *
     * @return boolean
     */
    public function getHierarchyLevel() {
        return $this->hierarchyLevel;
    }

    /**
     * Set public
     *
     * @param string $hierarchyLevel
     * @return Metadata
     */
    public function setHierarchyLevel($hierarchyLevel) {
        $this->hierarchyLevel = $hierarchyLevel;
        return $this;
    }
    
    /**
     * Get groups
     *
     * @return array
     */
    public function getGroups() {
        return array_filter(explode(',', $this->groups));
    }

    /**
     * Set groups
     *
     * @param array $groups
     * @return Metadata
     */
    public function setGroups($groups) {
        $this->groups = implode(',', array_filter($groups));
        return $this;
    }
}