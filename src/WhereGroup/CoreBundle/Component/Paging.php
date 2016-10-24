<?php

namespace WhereGroup\CoreBundle\Component;

/**
 * Paging
 * @author A.R.Pour
 */
class Paging
{
    private $count  = 0;
    private $limit  = 0;
    private $offset = 0;
    private $length = 10;

    /**
     * Paging constructor.
     * @param $count
     * @param $limit
     * @param null $page
     * @param null $offset
     */
    public function __construct($count, $limit, $page = null, $offset = null)
    {
        $this->count = (int)$count;
        $this->limit = (int)$limit;

        if (!is_null($page)) {
            $this->offset = (int)($page * $limit) - $limit;
        } elseif (!is_null($offset)) {
            $this->offset = (int)$offset;
        }
    }

    /**
     * @param $length
     * @return $this
     */
    public function length($length)
    {
        $this->length = (int)$length;

        return $this;
    }

    /**
     * @return \stdClass
     */
    public function calculate()
    {

        $response = new \stdClass();
        $response->limit  = (int)$this->limit;
        $response->count  = (int)$this->count;
        $response->offset = (int)$this->offset;
        $response->pages  = (int)$this->limit > 0
            ? (int)ceil($response->count / $this->limit)
            : 0;

        $response->currentPage = (int)floor(($response->offset / $this->limit)) + 1;

        if ($response->pages >= 1) {
            // INDEX START
            if ($response->currentPage > ($this->length / 2)) {
                $response->startPage = (int)$response->currentPage - floor($this->length / 2);
            } else {
                $response->startPage = 1;
            }

            // INDEX END
            if (($response->startPage + $this->length - 1) > $response->pages
                && $response->pages > ($this->length - 1)) {
                $response->endPage = (int)ceil($response->pages);
            } else {
                $response->endPage = (int)$response->startPage + $this->length - 1;
            }

            // END OF LIST?
            if ($response->endPage - $response->startPage < $this->length) {
                $response->startPage = (int)$response->startPage
                    - ($this->length - ($response->endPage - $response->startPage));
            }

            if ($response->startPage < 1) {
                $response->startPage = 1;
            }

            if ($response->currentPage < $response->pages) {
                $response->nextPage = (int)$response->currentPage + 1;
            }

            if ($response->currentPage > 1) {
                $response->prevPage = (int)$response->currentPage - 1;
            }
        }
        return $response;
    }
}
