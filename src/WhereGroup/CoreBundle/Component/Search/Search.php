<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Class Search
 * @package WhereGroup\CoreBundle\Component\Search
 */
abstract class Search
{
    protected $hits       = null;
    protected $page       = null;
    protected $offset     = null;
    protected $terms      = null;
    protected $source     = null;
    protected $profile    = null;
    protected $groups     = null;
    protected $public     = null;
    protected $keyword    = null;
    protected $sort       = null;
    protected $parmeters  = null;

    /* @var Expression $expression */
    protected $expression = null;

    /**
     * @return null
     */
    public function getParmeters()
    {
        return $this->parmeters;
    }

    /**
     * @param null $parmeters
     * @return Search
     */
    public function setParmeters($parmeters)
    {
        $this->parmeters = $parmeters;
        return $this;
    }

    /**
     * @return null
     */
    public function getSort()
    {
        return $this->sort;
    }

    /**
     * @param null $sort
     * @return Search
     */
    public function setSort($sort)
    {
        $this->sort = $sort;
        return $this;
    }

    /**
     * @return null
     */
    public function getKeyword()
    {
        return $this->keyword;
    }

    /**
     * @param $keyword
     * @return Search
     */
    public function setKeyword($keyword)
    {
        $this->keyword = $keyword;

        return $this;
    }

    /**
     * @return array
     */
    public function getTerms()
    {
        return (array)explode(' ', $this->terms);
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
        if (is_null($this->page)) {
            $this->page = 1;
        }

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
        if (is_null($this->hits)) {
            $this->hits = 10;
        }

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
        $paging = new Paging(
            $this->getResultCount(),
            is_null($this->hits) ? 10 : $this->hits,
            is_null($this->page) ? 1 : $this->page
        );

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
     * @return string|array
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
     * @return null|array
     */
    public function getGroups()
    {
        return $this->groups;
    }

    /**
     * @param $public
     * @return Search
     */
    public function setPublic($public)
    {
        $this->public = (boolean)$public;

        return $this;
    }

    /**
     * @param array $groups
     * @return $this
     */
    public function setGroups(array $groups)
    {
        $this->groups = $groups;

        return $this;
    }

    /**
     * @param Expression $expression
     * @return $this
     */
    public function setExpression(Expression $expression)
    {
        $this->expression = $expression;

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
     * @return array
     */
    abstract public function find();
}
