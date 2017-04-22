<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use WhereGroup\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use WhereGroup\UserBundle\Entity\Group;

/**
 * WhereGroup\CoreBundle\Entity\Metadata
 *
 * @ORM\Table(name="metadata")
 * @ORM\Entity
 * @ORM\MappedSuperclass
 * @ORM\Entity(repositoryClass="WhereGroup\CoreBundle\Entity\MetadataRepository")
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
     * @ORM\Column(type="boolean")
     */
    private $locked;

    /**
     * @ORM\ManyToOne(targetEntity="WhereGroup\CoreBundle\Entity\Source")
     * @ORM\JoinColumn(name="source_id", referencedColumnName="id")
     */
    private $source;

    /**
     * @ORM\Column(type="string", length=255, unique=true)
     */
    private $uuid;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $codespace;

    /**
     * @ORM\Column(type="string", length=32, nullable=true)
     */
    private $hierarchyLevel;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $profile;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $title;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $abstract;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $searchfield;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $browserGraphic;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $object;

    /**
     * @ORM\Column(type="boolean", name="`public`", nullable=true)
     */
    private $public;

    /**
     * @ORM\ManyToMany(targetEntity="WhereGroup\UserBundle\Entity\Group", inversedBy="metadata")
     * @ORM\JoinTable(name="metadata_groups")
     */
    private $groups;

    /**
     * @ORM\Column(type="boolean")
     */
    private $readonly;

    /**
     * @ORM\Column(type="date", nullable=true, name="`date`")
     */
    private $date;

    /**
     * @ORM\Column(type="float", nullable=true)
     */
    private $bboxn;

    /**
     * @ORM\Column(type="float", nullable=true)
     */
    private $bboxe;

    /**
     * @ORM\Column(type="float", nullable=true)
     */
    private $bboxs;

    /**
     * @ORM\Column(type="float", nullable=true)
     */
    private $bboxw;

    /**
     * Metadata constructor.
     */
    public function __construct()
    {
        $this->groups = new ArrayCollection();
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param $insertTime
     * @return $this
     */
    public function setInsertTime($insertTime)
    {
        $this->insertTime = $insertTime;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getInsertTime()
    {
        return $this->insertTime;
    }

    /**
     * @param $updateTime
     * @return $this
     */
    public function setUpdateTime($updateTime)
    {
        $this->updateTime = $updateTime;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getUpdateTime()
    {
        return $this->updateTime;
    }

    /**
     * @param $uuid
     * @return $this
     */
    public function setUuid($uuid)
    {
        $this->uuid = $uuid;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getUuid()
    {
        return $this->uuid;
    }

    /**
     * @param $codespace
     * @return $this
     */
    public function setCodespace($codespace)
    {
        $this->codespace = $codespace;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getCodespace()
    {
        return $this->codespace;
    }

    /**
     * @param $title
     * @return $this
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param $abstract
     * @return $this
     */
    public function setAbstract($abstract)
    {
        $this->abstract = $abstract;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getAbstract()
    {
        return $this->abstract;
    }

    /**
     * @param $searchfield
     * @return $this
     */
    public function setSearchfield($searchfield)
    {
        $this->searchfield = $searchfield;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSearchfield()
    {
        return $this->searchfield;
    }

    /**
     * @param $browserGraphic
     * @return $this
     */
    public function setBrowserGraphic($browserGraphic)
    {
        $this->browserGraphic = $browserGraphic;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getBrowserGraphic()
    {
        return $this->browserGraphic;
    }

    /**
     * @param User|null $insertUser
     * @return $this
     */
    public function setInsertUser(User $insertUser = null)
    {
        $this->insertUser = $insertUser;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getInsertUser()
    {
        return $this->insertUser;
    }

    /**
     * @param User|null $updateUser
     * @return $this
     */
    public function setUpdateUser(User $updateUser = null)
    {
        $this->updateUser = $updateUser;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getUpdateUser()
    {
        return $this->updateUser;
    }

    /**
     * @return mixed
     */
    public function getObject()
    {
        return json_decode($this->object, true);
    }

    /**
     * @param $object
     * @return $this
     */
    public function setObject($object)
    {
        $this->object = json_encode($object);
        return $this;
    }

    /**
     * @return mixed
     */
    public function getPublic()
    {
        return $this->public;
    }

    /**
     * @param $public
     * @return $this
     */
    public function setPublic($public)
    {
        $this->public = $public;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getHierarchyLevel()
    {
        return $this->hierarchyLevel;
    }

    /**
     * @param $hierarchyLevel
     * @return $this
     */
    public function setHierarchyLevel($hierarchyLevel)
    {
        $this->hierarchyLevel = $hierarchyLevel;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getProfile()
    {
        return $this->profile;
    }

    /**
     * @param $profile
     * @return $this
     */
    public function setProfile($profile)
    {
        $this->profile = $profile;
        return $this;
    }

    /**
     * @param Group $group
     * @return $this
     */
    public function addGroups(Group $group)
    {
        $this->groups[] = $group;

        return $this;
    }

    /**
     * @param Group $group
     */
    public function removeGroups(Group $group)
    {
        $this->groups->removeElement($group);
    }

    /**
     * @return ArrayCollection
     */
    public function getGroups()
    {
        return $this->groups;
    }

    /**
     * @return mixed
     */
    public function getReadonly()
    {
        return $this->readonly;
    }

    /**
     * @param $readonly
     * @return $this
     */
    public function setReadonly($readonly)
    {
        $this->readonly = (boolean)$readonly;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * @param $date
     * @return $this
     */
    public function setDate($date)
    {
        $this->date = $date;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getBboxn()
    {
        return $this->bboxn;
    }

    /**
     * @return mixed
     */
    public function getBboxw()
    {
        return $this->bboxw;
    }

    /**
     * @param $bboxw
     * @return $this
     */
    public function setBboxw($bboxw)
    {
        $this->bboxw = $bboxw;
        return $this;
    }

    /**
     * @param $bboxn
     * @return $this
     */
    public function setBboxn($bboxn)
    {
        $this->bboxn = $bboxn;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getBboxs()
    {
        return $this->bboxs;
    }

    /**
     * @param $bboxs
     * @return $this
     */
    public function setBboxs($bboxs)
    {
        $this->bboxs = $bboxs;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getBboxe()
    {
        return $this->bboxe;
    }

    /**
     * @param $bboxe
     * @return $this
     */
    public function setBboxe($bboxe)
    {
        $this->bboxe = $bboxe;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getLocked()
    {
        return $this->locked;
    }

    /**
     * @param mixed $locked
     * @return Metadata
     */
    public function setLocked($locked)
    {
        $this->locked = $locked;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * @param mixed $source
     * @return Metadata
     */
    public function setSource($source)
    {
        $this->source = $source;
        return $this;
    }
}
