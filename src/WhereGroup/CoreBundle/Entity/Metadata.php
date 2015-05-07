<?php
namespace WhereGroup\CoreBundle\Entity;

use WhereGroup\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * WhereGroup\CoreBundle\Entity\Metadata
 *
 * @ORM\Table(name="metador_metadata")
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
     * @ORM\Column(type="text", nullable=true)
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

    public function getId()
    {
        return $this->id;
    }

    public function setInsertTime($insertTime)
    {
        $this->insertTime = $insertTime;

        return $this;
    }

    public function getInsertTime()
    {
        return $this->insertTime;
    }

    public function setUpdateTime($updateTime)
    {
        $this->updateTime = $updateTime;

        return $this;
    }

    public function getUpdateTime()
    {
        return $this->updateTime;
    }

    public function setUuid($uuid)
    {
        $this->uuid = $uuid;

        return $this;
    }

    public function getUuid()
    {
        return $this->uuid;
    }

    public function setCodespace($codespace)
    {
        $this->codespace = $codespace;

        return $this;
    }

    public function getCodespace()
    {
        return $this->codespace;
    }

    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    public function getTitle()
    {
        return $this->title;
    }

    public function setAbstract($abstract)
    {
        $this->abstract = $abstract;

        return $this;
    }

    public function getAbstract()
    {
        return $this->abstract;
    }

    public function setSearchfield($searchfield)
    {
        $this->searchfield = $searchfield;

        return $this;
    }

    public function getSearchfield()
    {
        return $this->searchfield;
    }

    public function setBrowserGraphic($browserGraphic)
    {
        $this->browserGraphic = $browserGraphic;

        return $this;
    }

    public function getBrowserGraphic()
    {
        return $this->browserGraphic;
    }

    public function setInsertUser(User $insertUser = null)
    {
        $this->insertUser = $insertUser;

        return $this;
    }

    public function getInsertUser()
    {
        return $this->insertUser;
    }

    public function setUpdateUser(User $updateUser = null)
    {
        $this->updateUser = $updateUser;

        return $this;
    }

    public function getUpdateUser()
    {
        return $this->updateUser;
    }

    public function getObject()
    {
        return json_decode($this->object, true);
    }

    public function setObject($object)
    {
        $this->object = json_encode($object);
        return $this;
    }

    public function getPublic()
    {
        return $this->public;
    }

    public function setPublic($public)
    {
        $this->public = $public;
        return $this;
    }

    public function getHierarchyLevel()
    {
        return $this->hierarchyLevel;
    }

    public function setHierarchyLevel($hierarchyLevel)
    {
        $this->hierarchyLevel = $hierarchyLevel;
        return $this;
    }

    public function getProfile()
    {
        return $this->profile;
    }

    public function setProfile($profile)
    {
        $this->profile = $profile;
        return $this;
    }

    public function getGroups()
    {
        return explode(',', $this->groups);
    }

    public function setGroups($groups)
    {
        $array = array_filter($groups);
        sort($array);

        $this->groups = implode(',', $array);
        return $this;
    }

    public function getReadonly()
    {
        return $this->readonly;
    }

    public function setReadonly($readonly)
    {
        $this->readonly = (boolean)$readonly;
        return $this;
    }

    public function getDate()
    {
        return $this->date;
    }

    public function setDate($date)
    {
        $this->date = $date;
        return $this;
    }

    public function getBboxn()
    {
        return $this->bboxn;
    }

    public function getBboxw()
    {
        return $this->bboxw;
    }

    public function setBboxw($bboxw)
    {
        $this->bboxw = $bboxw;
        return $this;
    }

    public function setBboxn($bboxn)
    {
        $this->bboxn = $bboxn;
        return $this;
    }

    public function getBboxs()
    {
        return $this->bboxs;
    }

    public function setBboxs($bboxs)
    {
        $this->bboxs = $bboxs;
        return $this;
    }

    public function getBboxe()
    {
        return $this->bboxe;
    }

    public function setBboxe($bboxe)
    {
        $this->bboxe = $bboxe;
        return $this;
    }
}
