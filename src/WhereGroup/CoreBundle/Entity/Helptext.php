<?php
namespace WhereGroup\CoreBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * WhereGroup\CoreBundle\Entity\Helptext
 *
 * @ORM\Table(name="metador_helptext")
 * @ORM\Entity
 */
class Helptext
{
    /**
     * @ORM\Column(type="string", length=255)
     * @ORM\Id
     */
    private $id;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $text;

    /**
     * Get id
     *
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set id
     *
     * @return Helptext
     */
    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * Get text
     *
     * @return text
     */
    public function getText()
    {
        return $this->text;
    }

    /**
     * Set text
     *
     * @return Helptext
     */
    public function setText($text)
    {
        $this->text = $text;

        return $this;
    }
}
