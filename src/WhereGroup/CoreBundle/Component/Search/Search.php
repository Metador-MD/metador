<?php

namespace WhereGroup\CoreBundle\Component\Search;

use WhereGroup\CoreBundle\Component\Search\Paging;

/**
 * Class Search
 * @package WhereGroup\CoreBundle\Component\Search
 */
abstract class Search
{
    protected $hits = 10;
    protected $page = 1;
    protected $offset = 0;
    protected $terms = '';
    protected $source = '';
    protected $profile = '';

    /**
     * @param $terms
     * @return $this
     */
    public function setTerms($terms)
    {
        $this->terms = $terms;

        return $this;
    }

    /**
     * @return array
     */
    public function getTerms()
    {
        return explode(' ', $this->terms);
    }

    /**
     * @param $hits
     * @return $this
     */
    public function setHits($hits)
    {
        $this->hits = (int)$hits;
        $this->offset = ($this->hits * $this->page) - $this->hits;

        return $this;
    }

    /**
     * @return int
     */
    public function getHits()
    {
        return $this->hits;
    }

    /**
     * @param $page
     * @return $this
     */
    public function setPage($page)
    {
        $this->page = (int)$page;
        $this->offset = ($this->hits * $this->page) - $this->hits;

        return $this;
    }

    /**
     * @return int
     */
    public function getPage()
    {
        return $this->page;
    }

    /**
     * @return int
     */
    public function getOffset()
    {
        return $this->offset;
    }

    /**
     * @return \stdClass
     */
    public function getResultPaging()
    {
        $paging = new Paging($this->getResultCount(), $this->hits, $this->page);

        return $paging->calculate();
    }

    /**
     * @param $source
     * @return $this
     */
    public function setSource($source)
    {
        $this->source = $source;

        return $this;
    }

    /**
     * @return string
     */
    public function getSource()
    {
        return $this->source;
    }


    /**
     * @return string
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
}
