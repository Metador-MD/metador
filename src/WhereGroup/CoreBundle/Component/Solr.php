<?php

namespace WhereGroup\CoreBundle\Component;

use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;

class Solr
{
    public $client;
    public $query;
    public $host;
    public $port;
    public $path;

    /**
     * Solr constructor.
     * @param $host
     * @param $port
     * @param $path
     */
    public function __construct($host, $port, $path)
    {
        $this->host = $host;
        $this->port = $port;
        $this->path = $path;

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

    /**
     * @param \WhereGroup\CoreBundle\Entity\Metadata $metadata
     * @throws MetadataException
     */
    public function updateMetadata($metadata)
    {
        if (!$this->isActive()) {
            return;
        }

        $p         = $metadata->getObject();

        /** @var \SolrInputDocument $doc */
        $doc       = $this->newDocument();
        $date      = $metadata->getDate();
        $dateStamp = $metadata->getDateStamp();

        $doc->addField('id', $metadata->getId());
        $doc->addField('abstract', $metadata->getAbstract());

        if ($date instanceof \DateTime) {
            $doc->addField('date', $date->format('Y-m-d'));
        }

        if ($dateStamp instanceof \DateTime) {
            $doc->addField('dateStamp', $dateStamp->format('Y-m-d'));
        }

        $doc->addField('hierarchyLevel', $metadata->getHierarchyLevel());
        $doc->addField('keywords', $metadata->getKeywords());
        $doc->addField('topicCategory', $metadata->getTopicCategory());
        $doc->addField('object', json_encode($p));
        $doc->addField('parent', $metadata->getParent());
        $doc->addField('profile', $metadata->getProfile());
        $doc->addField('public', $metadata->getPublic());
        $doc->addField('searchfield', $metadata->getSearchfield());
        $doc->addField('anyText', $metadata->getAnytext());
        $doc->addField('source', $metadata->getSource());
        $doc->addField('title', $metadata->getTitle());
        $doc->addField('uuid', $metadata->getUuid());
        $doc->addField('insertUsername', $p['_insert_user']);
        $doc->addField('insertTime', $p['_insert_time']);

        if (isset($p['_groups']) && is_array($p['_groups'])) {
            $doc->addField('role', implode(' ', $p['_groups']));
        }

        if (!empty($metadata->getBboxn()) && !empty($metadata->getBboxe())
            && !empty($metadata->getBboxs()) && !empty($metadata->getBboxw())
        ) {
            $doc->addField('bboxn', $metadata->getBboxn());
            $doc->addField('bboxe', $metadata->getBboxe());
            $doc->addField('bboxs', $metadata->getBboxs());
            $doc->addField('bboxw', $metadata->getBboxw());
        }

        try {
            $this->client->addDocument($doc);
            $this->client->commit();
        } catch (\SolrClientException $e) {
            throw new MetadataException('Solr-Server nicht erreichbar.');
        }
    }
}
