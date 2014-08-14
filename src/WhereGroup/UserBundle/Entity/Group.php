<?php
namespace WhereGroup\UserBundle\Entity;

use Symfony\Component\Security\Core\Role\RoleInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * WhereGroup\UserBundle\Entity\User
 * @ORM\Table(name="groups")
 * @ORM\Entity()
 */
class Group implements RoleInterface
{
    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id()
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(name="role", type="string", length=255, unique=true)
     */
    private $role;

    /**
     * @ORM\ManyToMany(targetEntity="User", mappedBy="groups")
     */
    private $users;

    public function __construct()
    {
        $this->users = new ArrayCollection();
    }

    /**
     * @see RoleInterface
     */
    public function getRole()
    {
        return $this->role;
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
        $role = preg_replace("/[^äöüßÄÖÜa-z0-9]/i", "_", mb_strtoupper($role));
        $role = preg_replace("/[_]+/", "_", $role);
        $role = rtrim(ltrim($role, "_"), "_");

        if (substr($role, 0, strlen("ROLE_")) !== "ROLE_") {
            $role = "ROLE_" . $role;
        }

        $this->role = $role;

        return $this;
    }

    /**
     * Add users
     *
     * @param \WhereGroup\UserBundle\Entity\User $users
     * @return Group
     */
    public function addUser(\WhereGroup\UserBundle\Entity\User $users)
    {
        $this->users[] = $users;

        return $this;
    }

    /**
     * Remove users
     *
     * @param \WhereGroup\UserBundle\Entity\User $users
     */
    public function removeUser(\WhereGroup\UserBundle\Entity\User $users)
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


    public function __toString()
    {
        return (string)$this->getId();
    }
}
