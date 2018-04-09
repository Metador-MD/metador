<?php

namespace WhereGroup\CoreBundle\Component;

/**
 * Class Solr
 * @package Plugins\LVermGeo\BasicProfileBundle\Component
 */
class Solr
{
    public $client;

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
            $pingresponse = $this->client->ping();
            return true;
        } catch (\SolrClientException $e) {
            $data = $e->getMessage();
        }

        return false;
    }

    /**
     * @return \SolrInputDocument
     */
    public function newDocument()
    {
        return new \SolrInputDocument();
    }
}
