<?php

namespace WhereGroup\CoreBundle\Component\Search;

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
    protected $filter = null;

    /**
     * @return array
     */
    public function getTerms()
    {
        return explode(' ', $this->terms);
    }

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
     * @return int
     */
    public function getHits()
    {
        return $this->hits;
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
    public function getPage()
    {
        return $this->page;
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
    public function getOffset()
    {
        return $this->offset;
    }

    /**
     * @param $offset
     * @return $this
     */
    public function setOffset($offset)
    {
        $this->offset = (int)$offset;

        return $this;
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
     * @return string
     */
    public function getSource()
    {
        return $this->source;
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
     * @return int
     */
    abstract public function getResultCount();

    /**
     * @return ExprHandler
     */
    abstract public function createExpression();

    /**
     * @param Expression $expression
     * @return mixed
     */
    abstract public function setExpression(Expression $expression);
}
