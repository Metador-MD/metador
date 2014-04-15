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
    private $object;

    /**
     * @ORM\Column(type="boolean")
     */
    private $public;

    /**
     * @ORM\Column(type="text")
     */
    private $groups;

    /**
     * @ORM\Column(type="boolean")
     */
    private $readonly;

    /**
     * @ORM\Column(type="date", nullable=true)
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
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filter0;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filter1;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filter2;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filter3;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filter4;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filter5;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filter6;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filter7;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filter8;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $filter9;

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
    public function getObject()
    {
        return unserialize($this->object);
    }

    /**
     * Set metadata
     *
     * @param string $metadata
     * @return Metadata
     */
    public function setObject($object)
    {
        $this->object = serialize($object);
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
        return explode(',', $this->groups);
    }

    /**
     * Set groups
     *
     * @param array $groups
     * @return Metadata
     */
    public function setGroups($groups) {
        $array = array_filter($groups);
        sort($array);

        $this->groups = implode(',', $array);
        return $this;
    }


    /**
     * Get readonly status.
     *
     * @return boolean
     */
    public function getReadonly() {
        return $this->readonly;
    }

    /**
     * Set readonly status
     *
     * @param boolean $readonly
     * @return Metadata
     */
    public function setReadonly($readonly) {
        $this->readonly = (boolean)$readonly;
        return $this;
    }

    public function getDate() {
        return $this->date;
    }

    public function getBboxn() {
        return $this->bboxn;
    }

    public function getBboxw() {
        return $this->bboxw;
    }

    public function getBboxs() {
        return $this->bboxs;
    }

    public function getBboxe() {
        return $this->bboxe;
    }

    public function setDate($date) {
        $this->date = $date;
        return $this;
    }

    public function setBboxn($bboxn) {
        $this->bboxn = $bboxn;
        return $this;
    }

    public function setBboxw($bboxw) {
        $this->bboxw = $bboxw;
        return $this;
    }

    public function setBboxs($bboxs) {
        $this->bboxs = $bboxs;
        return $this;
    }

    public function setBboxe($bboxe) {
        $this->bboxe = $bboxe;
        return $this;
    }

/**
     * Gets the value of filter0.
     *
     * @return mixed
     */
    public function getFilter0()
    {
        return $this->filter0;
    }

    /**
     * Sets the value of filter0.
     *
     * @param mixed $filter0 the filter0
     *
     * @return self
     */
    public function setFilter0($filter0)
    {
        $this->filter0 = $filter0;

        return $this;
    }

    /**
     * Gets the value of filter1.
     *
     * @return mixed
     */
    public function getFilter1()
    {
        return $this->filter1;
    }

    /**
     * Sets the value of filter1.
     *
     * @param mixed $filter1 the filter1
     *
     * @return self
     */
    public function setFilter1($filter1)
    {
        $this->filter1 = $filter1;

        return $this;
    }

    /**
     * Gets the value of filter2.
     *
     * @return mixed
     */
    public function getFilter2()
    {
        return $this->filter2;
    }

    /**
     * Sets the value of filter2.
     *
     * @param mixed $filter2 the filter2
     *
     * @return self
     */
    public function setFilter2($filter2)
    {
        $this->filter2 = $filter2;

        return $this;
    }

    /**
     * Gets the value of filter3.
     *
     * @return mixed
     */
    public function getFilter3()
    {
        return $this->filter3;
    }

    /**
     * Sets the value of filter3.
     *
     * @param mixed $filter3 the filter3
     *
     * @return self
     */
    public function setFilter3($filter3)
    {
        $this->filter3 = $filter3;

        return $this;
    }

    /**
     * Gets the value of filter4.
     *
     * @return mixed
     */
    public function getFilter4()
    {
        return $this->filter4;
    }

    /**
     * Sets the value of filter4.
     *
     * @param mixed $filter4 the filter4
     *
     * @return self
     */
    public function setFilter4($filter4)
    {
        $this->filter4 = $filter4;

        return $this;
    }

    /**
     * Gets the value of filter5.
     *
     * @return mixed
     */
    public function getFilter5()
    {
        return $this->filter5;
    }

    /**
     * Sets the value of filter5.
     *
     * @param mixed $filter5 the filter5
     *
     * @return self
     */
    public function setFilter5($filter5)
    {
        $this->filter5 = $filter5;

        return $this;
    }

    /**
     * Gets the value of filter6.
     *
     * @return mixed
     */
    public function getFilter6()
    {
        return $this->filter6;
    }

    /**
     * Sets the value of filter6.
     *
     * @param mixed $filter6 the filter6
     *
     * @return self
     */
    public function setFilter6($filter6)
    {
        $this->filter6 = $filter6;

        return $this;
    }

    /**
     * Gets the value of filter7.
     *
     * @return mixed
     */
    public function getFilter7()
    {
        return $this->filter7;
    }

    /**
     * Sets the value of filter7.
     *
     * @param mixed $filter7 the filter7
     *
     * @return self
     */
    public function setFilter7($filter7)
    {
        $this->filter7 = $filter7;

        return $this;
    }

    /**
     * Gets the value of filter8.
     *
     * @return mixed
     */
    public function getFilter8()
    {
        return $this->filter8;
    }

    /**
     * Sets the value of filter8.
     *
     * @param mixed $filter8 the filter8
     *
     * @return self
     */
    public function setFilter8($filter8)
    {
        $this->filter8 = $filter8;

        return $this;
    }

    /**
     * Gets the value of filter9.
     *
     * @return mixed
     */
    public function getFilter9()
    {
        return $this->filter9;
    }

    /**
     * Sets the value of filter9.
     *
     * @param mixed $filter9 the filter9
     *
     * @return self
     */
    public function setFilter9($filter9)
    {
        $this->filter9 = $filter9;

        return $this;
    }
}