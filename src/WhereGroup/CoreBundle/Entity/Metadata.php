<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping\Index;
use WhereGroup\AddressBundle\Entity\Address;
use WhereGroup\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use WhereGroup\UserBundle\Entity\Group;

/**
 * WhereGroup\CoreBundle\Entity\Metadata
 *
 * @ORM\Table(name="metadata", indexes={
 *     @Index(name="metadata_idx", columns={"title", "date", "parent", "source", "public", "profile", "hierarchy_level"})
 * })
 * @ORM\Entity
 * @ORM\MappedSuperclass
 * @ORM\Entity(repositoryClass="WhereGroup\CoreBundle\Entity\MetadataRepository")
 */
class Metadata
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string", length=36, unique=true)
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
     * @ORM\Column(type="integer", nullable=true)
     */
    private $lockTime;

    /**
     * @ORM\ManyToOne(targetEntity="WhereGroup\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="insertuser_id", referencedColumnName="id")
     */
    private $insertUser;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $insertUsername;

    /**
     * @ORM\ManyToOne(targetEntity="WhereGroup\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="updateuser_id", referencedColumnName="id")
     */
    private $updateUser;

    /**
     * @ORM\ManyToOne(targetEntity="WhereGroup\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="lockuser_id", referencedColumnName="id")
     */
    private $lockUser;

    /**
     * @ORM\Column(type="boolean")
     */
    private $locked;

    /**
     * @ORM\Column(type="string", length=255, nullable=false)
     */
    private $source;

    /**
     * @ORM\Column(type="string", length=32, nullable=true)
     */
    private $hierarchyLevel;

    /**
     * @ORM\Column(type="string", length=255, nullable=false)
     */
    private $profile;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $parent;

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
    private $anyText;

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
     * @ORM\ManyToMany(targetEntity="WhereGroup\AddressBundle\Entity\Address", inversedBy="metadata")
     * @ORM\JoinTable(name="metadata_address")
     */
    private $address;

    /**
     * @ORM\Column(type="date", nullable=true, name="`date`")
     */
    private $date;

    /**
     * @ORM\Column(type="date", nullable=true, name="`date_stamp`")
     */
    private $dateStamp;

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
     * @ORM\Column(type="text", nullable=true)
     */
    private $keywords;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $topicCategory;

    /**
     * Metadata constructor.
     */
    public function __construct()
    {
        $this->groups = new ArrayCollection();
        $this->address = new ArrayCollection();
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
     * @param $lockTime
     * @return $this
     */
    public function setLockTime($lockTime)
    {
        $this->lockTime = $lockTime;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getLockTime()
    {
        return $this->lockTime;
    }

    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
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
     * @return mixed
     */
    public function getAnyText()
    {
        return $this->anyText;
    }

    /**
     * @param mixed $anytext
     * @return Metadata
     */
    public function setAnyText($anytext)
    {
        $this->anyText = $anytext;
        return $this;
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
     * @param User|null $lockUser
     * @return $this
     */
    public function setLockUser(User $lockUser = null)
    {
        $this->lockUser = $lockUser;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getLockUser()
    {
        return $this->lockUser;
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
        if (!$this->groups->contains($group)) {
            $this->groups[] = $group;
        }

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
     * @return $this
     */
    public function clearGroups()
    {
        $this->groups->clear();

        return $this;
    }

    /**
     * @param Address $address
     * @return $this
     */
    public function addAddress(Address $address)
    {
        if (!$this->address->contains($address)) {
            $this->address[] = $address;
        }

        return $this;
    }

    /**
     * @param Address $address
     * @return Metadata
     */
    public function removeAddress(Address $address)
    {
        $this->address->removeElement($address);

        return $this;
    }

    /**
     * @return $this
     */
    public function clearAddress()
    {
        $this->address->clear();

        return $this;
    }

    /**
     * @return ArrayCollection
     */
    public function getAddress()
    {
        return $this->address;
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

    /**
     * @return mixed
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * @param mixed $parent
     * @return Metadata
     */
    public function setParent($parent)
    {
        $this->parent = $parent;
        return $this;
    }


    /**
     * @return mixed
     */
    public function getKeywords()
    {
        return $this->keywords;
    }

    /**
     * @param mixed $keywords
     * @return Metadata
     */
    public function setKeywords($keywords)
    {
        $this->keywords = $keywords;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDateStamp()
    {
        return $this->dateStamp;
    }

    /**
     * @param mixed $dateStamp
     * @return Metadata
     */
    public function setDateStamp($dateStamp)
    {
        $this->dateStamp = $dateStamp;
        return $this;
    }


    /**
     * @return mixed
     */
    public function getInsertUsername()
    {
        return $this->insertUsername;
    }

    /**
     * @param mixed $insertUsername
     * @return Metadata
     */
    public function setInsertUsername($insertUsername)
    {
        $this->insertUsername = $insertUsername;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getTopicCategory()
    {
        return $this->topicCategory;
    }

    /**
     * @param mixed $topicCategory
     * @return Metadata
     */
    public function setTopicCategory($topicCategory)
    {
        $this->topicCategory = $topicCategory;
        return $this;
    }
}
