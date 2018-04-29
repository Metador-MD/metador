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

    /**
     * @param \WhereGroup\CoreBundle\Entity\Metadata $metadata
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
        $doc->addField('date', $date->format('Y-m-d'));
        $doc->addField('dateStamp', $dateStamp->format('Y-m-d'));
        $doc->addField('hierarchyLevel', $metadata->getHierarchyLevel());
        $doc->addField('keywords', $metadata->getKeywords());
        $doc->addField('object', json_encode($p));
        $doc->addField('parent', $metadata->getParent());
        $doc->addField('profile', $metadata->getProfile());
        $doc->addField('public', $metadata->getPublic());
        $doc->addField('searchfield', $metadata->getSearchfield());
        $doc->addField('source', $metadata->getSource());
        $doc->addField('title', $metadata->getTitle());
        $doc->addField('uuid', $metadata->getUuid());
        $doc->addField('insertUsername', $p['_insert_user']);
        $doc->addField('insertTime', $p['_insert_time']);
        $doc->addField('group.role', isset($p['_group']) ? implode(' ', $p['_group']) : '');

        $anyText = $p;
        if (isset($anyText['processStep2']['responsibleParty'])) {
            unset($anyText['processStep2']['responsibleParty']);
        }

        $doc->addField('anyText', json_encode($anyText));
        unset($anyText);

        $updateResponse =  $this->solr->client->addDocument($doc);
        $this->solr->client->commit();
    }
}
