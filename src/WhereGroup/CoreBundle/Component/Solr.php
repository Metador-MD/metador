<?php

namespace WhereGroup\CoreBundle\Component;

/**
 * Class Solr
 * @package Plugins\LVermGeo\BasicProfileBundle\Component
 */
class Solr
{
    public $client;
    public $query;

    /**
     * Solr constructor.
     * @param $host
     * @param $port
     * @param $path
     */
    public function __construct($host, $port, $path)
    {
        if (!empty($host) && !empty($port) && !empty($path)) {
            $this->client = new \SolrClient([
                'hostname' => $host,
                'port'     => $port,
                'path'     => $path
            ]);

            $this->query = new \SolrQuery();
        }
    }

    /**
     * @return bool
     */
    public function isActive()
    {
        if (is_object($this->client)) {
            return true;
        }

        return false;
    }

    /**
     * @return bool
     */
    public function ping()
    {
        try {
            $this->client->ping();
            return true;
        } catch (\SolrClientException $e) {
        }

        return false;
    }

    /**
     * @return \SolrQuery
     */
    public function newQuery()
    {
        return new \SolrQuery();
    }

    /**
     * @return \SolrInputDocument
     */
    public function newDocument()
    {
        return new \SolrInputDocument();
    }
}
