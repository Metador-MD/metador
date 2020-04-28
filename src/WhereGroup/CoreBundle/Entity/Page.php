<?php

namespace WhereGroup\CoreBundle\Entity;

use Serializable;

/**
 * Class Page
 * @package WhereGroup\CoreBundle\Entity
 */
class Page implements Serializable
{
    protected $slug;

    protected $markdown;

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param mixed $slug
     * @return Page
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getMarkdown()
    {
        return $this->markdown;
    }

    /**
     * @param mixed $markdown
     * @return Page
     */
    public function setMarkdown($markdown)
    {
        $this->markdown = $markdown;
        return $this;
    }

    /**
     * @return false|string
     */
    public function serialize()
    {
        return json_encode([
            'slug' => $this->slug,
            'markdown' => $this->markdown
        ]);
    }

    /**
     * @param string $serialized
     * @return Page
     */
    public function unserialize($serialized)
    {
        $array = json_decode($serialized, true);
        $this->slug = $array['slug'];
        $this->markdown = $array['markdown'];
        return $this;
    }
}
