<?php
namespace WhereGroup\UserBundle\Entity;

use Symfony\Component\Security\Core\Role\RoleInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use WhereGroup\CoreBundle\Entity\Metadata;

/**
 * WhereGroup\UserBundle\Entity\User
 * @ORM\Table(name="groups")
 * @ORM\Entity
 * @ORM\Entity(repositoryClass="WhereGroup\UserBundle\Entity\GroupRepository")
 */
class Group
{
    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id()
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @ORM\Column(name="role", type="string", length=255, unique=true)
     */
    protected $role;

    /**
     * @ORM\ManyToMany(targetEntity="User", mappedBy="groups")
     */
    protected $users;

    /**
     * @ORM\ManyToMany(targetEntity="WhereGroup\CoreBundle\Entity\Metadata", mappedBy="groups")
     */
    protected $metadata;

    /**
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    protected $description;

    public function __construct()
    {
        $this->users    = new ArrayCollection();
        $this->metadata = new ArrayCollection();
    }

    /**
     * @see RoleInterface
     */
    public function getRole()
    {
        return mb_strtoupper($this->role, 'UTF-8');
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
     * Set role
     *
     * @param string $role
     * @return Group
     */
    public function setRole($role)
    {
        $role = preg_replace("/[^äöüßÄÖÜa-z0-9]/i", "_", mb_strtoupper($role, 'UTF-8'));
        $role = preg_replace("/[_]+/", "_", $role);
        $role = rtrim(ltrim($role, "_"), "_");

        if (substr($role, 0, strlen("ROLE_")) !== "ROLE_") {
            $role = "ROLE_" . $role;
        }

        $this->role = $role;

        return $this;
    }

    public function addUser(User $user)
    {
        $user->addGroup($this);
        $this->users->add($user);


        return $this;
    }

    /**
     * Remove users
     *
     * @param \WhereGroup\UserBundle\Entity\User $users
     */
    public function removeUser(User $users)
    {
        $this->users->removeElement($users);
    }

    /**
     * Get users
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getUsers()
    {
        return $this->users;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }


    public function addMetadata(Metadata $metadata)
    {
        $this->metadata[] = $metadata;

        return $this;
    }

    public function removeMetadata(Metadata $metadata)
    {
        $this->metadata->removeElement($metadata);
    }

    public function getMetadata()
    {
        return $this->metadata;
    }

    public function __toString()
    {
        return (string)$this->getId();
    }
}
