<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Interface SearchInterface
 * @package WhereGroup\CoreBundle\Component
 */
interface SearchInterface
{
    /**
     * @param $hits
     * @return mixed
     */
    public function setHits($hits);

    /**
     * @param $page
     * @return mixed
     */
    public function setPage($page);

    public function find();

    public function getResult();

    public function getResultCount();

    public function getResultPaging();
}
