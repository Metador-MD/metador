<?php

namespace Plugins\WhereGroup\BasicProfileBundle\EventListener;

use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Component\Logger;
use WhereGroup\CoreBundle\Component\Solr;
use WhereGroup\CoreBundle\Component\Source;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;
use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;

/**
 * Class MetadataListener
 * @package Plugins\Wheregroup\BasicProfileBundle\EventListener
 */
class MetadataListener
{
    private $profiles = array(
        'metador_series_profile',
        'metador_dataset_profile',
        'metador_service_profile',
        'metador_tile_profile'
    );

    private $em;

    /** @var \Plugins\WhereGroup\BasicProfileBundle\Component\Metadata */
    private $metadata;

    /** @var Source */
    private $source;

    /** @var Logger */
    private $logger;

    /** @var Solr */
    private $solr;

    /**
     * MetadataListener constructor.
     * @param EntityManagerInterface $em
     * @param \WhereGroup\CoreBundle\Component\Metadata $metadata
     * @param Source $source
     * @param Logger $logger
     * @param Solr $solr
     */
    public function __construct(
        EntityManagerInterface $em,
        \WhereGroup\CoreBundle\Component\Metadata $metadata,
        Source $source,
        Logger $logger,
        Solr $solr
    ) {
        $this->em = $em;
        $this->metadata = $metadata;
        $this->source = $source;
        $this->logger = $logger;
        $this->solr = $solr;
    }

    /**
     * @param MetadataChangeEvent $event
     * @throws \Exception
     */
    public function onLoad(MetadataChangeEvent $event)
    {
        /** @var Metadata $metadata */
        $metadata = $event->getDataset();
        $p = $metadata->getObject();

        if ($p['_profile'] !== 'metador_tile_profile'
            || !isset($p['parentIdentifier'])
            || empty($p['parentIdentifier'])) {
            return;
        }

        // Add inheritance
        try {
            $parentEntity = $this->metadata->getById($p['parentIdentifier']);
            $this->metadata->handleInheritance($p, $parentEntity->getObject());
        } catch (MetadataException $e) {
            $this->metadata->moveToQuarantine($metadata, $p);
        }

        $metadata->setObject($p);
    }

    /**
     * @param MetadataChangeEvent $event
     * @throws \Exception
     */
    public function onPreSave(MetadataChangeEvent $event)
    {

        $debug = [];
        /** @var Metadata $metadata */
        $metadata = $event->getDataset();
        $p = $metadata->getObject();

        if (!isset($p['_profile']) || empty($p['_profile']) || !in_array($p['_profile'], $this->profiles)) {
            return;
        }

        if (!isset($p['identifierCode']) || empty($p['identifierCode'])) {
            $uuid4 = Uuid::uuid4();

            $p['identifierCode'] = (isset($p['_uuid']) && !empty($p['_uuid']))
                ? $p['_uuid']
                : $uuid4->toString();
        }

        if ($p['_profile'] === 'metador_service_profile') {
            $p['levelDescription'] = isset($p['hierarchyLevelName']) ? $p['hierarchyLevelName'] : '';
        }

        if (isset($p['bbox']) &&
            isset($p['bbox']['nLatitude']) &&
            isset($p['bbox']['eLongitude']) &&
            isset($p['bbox']['sLatitude']) &&
            isset($p['bbox']['wLongitude'])
        ) {
            $metadata
                ->setBboxe((float)$p['bbox']['eLongitude'])
                ->setBboxn((float)$p['bbox']['nLatitude'])
                ->setBboxs((float)$p['bbox']['sLatitude'])
                ->setBboxw((float)$p['bbox']['wLongitude']);
        }

        $keywords = [];

        if (isset($p['keywords']) && is_array($p['keywords'])) {
            foreach ($p['keywords'] as $repo) {
                if (isset($repo['keywords']) && is_array($repo['keywords'])) {
                    foreach ($repo['keywords'] as $keyword) {
                        if (empty($keyword)) {
                            continue;
                        }
                        $keywords[] = $keyword;
                    }
                }
            }
        }

        if (isset($p['identifierCode']) && isset($p['identifierCodespace'])) {
            $p['identifierString'] = $p['identifierCodespace'] . '/' . $p['identifierCode'];
        }

        if (isset($p['accessConstraints']) && is_array($p['accessConstraints'])) {
            foreach ($p['accessConstraints'] as $key => $row) {
                if (isset($row['otherConstraints'])
                    && strstr($row['otherConstraints'], 'Zugriffsbeschränkungen:') === false) {
                    $p['accessConstraints'][$key]['otherConstraints']
                        = 'Zugriffsbeschränkungen: ' . $row['otherConstraints'];
                }
            }
        }

        if (isset($p['useConstraints']) && is_array($p['useConstraints'])) {
            foreach ($p['useConstraints'] as $key => $row) {
                if (isset($row['otherConstraints'])
                    && strstr($row['otherConstraints'], 'Nutzungsbedingungen:') === false) {
                    $p['useConstraints'][$key]['otherConstraints']
                        = 'Nutzungsbedingungen: ' . $row['otherConstraints'];
                }
            }
        }

        if (isset($p['useLimitation']) && is_array($p['useLimitation'])) {
            foreach ($p['useLimitation'] as $key => $row) {
                if (isset($row['otherConstraints'])
                    && strstr($row['otherConstraints'], 'Nutzungseinschränkungen:') === false) {
                    $p['useLimitation'][$key]['otherConstraints']
                        = 'Nutzungseinschränkungen: ' . $row['otherConstraints'];
                }
            }
        }

        ArrayParser::clearEmptyValues($p, true, true);
//        die('<pre>'.print_r($p, 1).'</pre>');

        $metadata->setKeywords(implode(' ', $keywords));
        $metadata->setSearchfield($this->prepareSearchField($p, $keywords));
        $metadata->setObject($p);
    }

    /**
     * @param $x
     * @param $y
     * @return mixed
     */
    private function min($x, $y)
    {
        if (empty($x) && !empty($y)) {
            return $y;
        }

        if (empty($y) && !empty($x)) {
            return $x;
        }

        return min($x, $y);
    }

    /**
     * @param $x
     * @param $y
     * @return mixed
     */
    private function max($x, $y)
    {
        if (empty($x) && !empty($y)) {
            return $y;
        }

        if (empty($y) && !empty($x)) {
            return $x;
        }

        return max($x, $y);
    }

    /**
     * @param $p
     * @param string $function
     * @return mixed|string
     */
    private function getDateFromObject($p, $function = 'min')
    {
        $date = '';

        foreach (['creationDate', 'publicationDate', 'revisionDate'] as $key) {
            if (isset($p[$key]) && !empty($p[$key])) {
                if ($function === 'max') {
                    $date = $this->max($date, $p[$key]);
                    continue;
                }

                $date = $this->min($date, $p[$key]);
            }
        }

        return $date;
    }

    /**
     * @param MetadataChangeEvent $event
     * @throws \Exception
     */
    public function onPostSave(MetadataChangeEvent $event)
    {
        /** @var Metadata $metadata */
        $metadata = $event->getDataset();
        $p = $metadata->getObject();

        if (!isset($p['_profile']) || empty($p['_profile']) || !in_array($p['_profile'], $this->profiles)) {
            return;
        }

        if ($p['_profile'] === 'metador_series_profile'
            && isset($p['_inheritance'])
            && is_array($p['_inheritance'])
            && !empty($p['_inheritance'])) {
            $this->em->getConnection()->beginTransaction();

            try {
                $entities = $this->em->getRepository('MetadorCoreBundle:Metadata')->findBy(
                    ['parent' => $p['_uuid']]
                );

                $p['temporalExtentBegin'] = '';
                $p['temporalExtentEnd'] = '';

                foreach ($entities as $entity) {
                    $childObject = $entity->getObject();

                    $p['temporalExtentBegin']
                        = $this->min($p['temporalExtentBegin'], $this->getDateFromObject($childObject, 'min'));
                    $p['temporalExtentEnd']
                        = $this->max($p['temporalExtentEnd'], $this->getDateFromObject($childObject, 'max'));

                    $this->metadata->handleInheritance($childObject, $p);
                    $entity->setObject($childObject);
                    $this->em->persist($entity);
                    $this->solr->updateMetadata($entity);
                }

                $metadata->setObject($p);
                $this->em->persist($metadata);
                $this->em->flush();
                $this->em->getConnection()->commit();
            } catch (\Exception $e) {
                $this->em->getConnection()->rollback();
                $this->em->clear();
                throw $e;
            }
        } elseif ($p['_profile'] === 'metador_tile_profile' && isset($p['parentIdentifier'])) {
            $this->em->getConnection()->beginTransaction();

            try {
                $entities = $this->em->getRepository('MetadorCoreBundle:Metadata')->findBy(
                    ['parent' => $p['parentIdentifier']]
                );

                $parentEntity = $this->em->getRepository('MetadorCoreBundle:Metadata')
                    ->findOneByUuid($p['parentIdentifier']);

                if ($parentEntity) {
                    $parentObject = $parentEntity->getObject();

                    $parentObject['temporalExtentBegin'] = '';
                    $parentObject['temporalExtentEnd'] = '';

                    foreach ($entities as $entity) {
                        $childObject = $entity->getObject();

                        $parentObject['temporalExtentBegin'] = $this->min(
                            $parentObject['temporalExtentBegin'],
                            $this->getDateFromObject($childObject, 'min')
                        );

                        $parentObject['temporalExtentEnd'] = $this->max(
                            $parentObject['temporalExtentEnd'],
                            $this->getDateFromObject($childObject, 'max')
                        );
                    }

                    $parentEntity->setObject($parentObject);
                    $this->em->persist($parentEntity);
                    $this->em->flush();
                    $this->em->getConnection()->commit();
                    $this->solr->updateMetadata($parentEntity);
                }
            } catch (\Exception $e) {
                $this->em->getConnection()->rollback();
                $this->em->clear();
                throw $e;
            }
        }

        $this->solr->updateMetadata($metadata);
    }

    /**
     * @param MetadataChangeEvent $event
     */
    public function onPreDelete(MetadataChangeEvent $event)
    {
        /** @var Metadata $metadata */
        $metadata = $event->getDataset();
        $p = $metadata->getObject();

        if (!isset($p['_profile']) || empty($p['_profile']) || !in_array($p['_profile'], $this->profiles)) {
            return;
        }

        if ($this->solr->isActive()) {
            $this->solr->client->deleteByQuery('uuid:' . $p['_uuid']);
            $this->solr->client->commit();
        }

        if (isset($p['_profile']) && $p['_profile'] === 'metador_series_profile') {
            $rows = $this->metadata->getChildren($p['_uuid']);
            $em = $this->metadata->getEntityManager();

            foreach ($rows as $row) {
                $em->remove($row);

                if ($this->solr->isActive()) {
                    $this->solr->client->deleteByQuery('uuid:' . $row->getUuid());
                }
            }

            $em->flush();

            if ($this->solr->isActive()) {
                $this->solr->client->commit();
            }
        }
    }

    /**
     * @param $p
     * @param $keywords
     * @return string
     */
    protected function prepareSearchField($p, $keywords)
    {
        $searchfield = '';
        $searchfield .= isset($p['title']) ? ' ' . $p['title'] : '';
        $searchfield .= isset($p['alternateTitle']) ? ' ' . implode(' ', $p['alternateTitle']) : '';
        $searchfield .= isset($p['abstract']) ? ' ' . $p['abstract'] : '';
        $searchfield .= isset($p['topicCategory']) ? ' ' . implode(" ", $p['topicCategory']) : '';
        $searchfield .= ' ' . implode(" ", $keywords);

        return trim(strtolower($searchfield));
    }

    /**
     * @param $type
     * @param $id
     * @param $message
     * @param $messageParam
     * @param $path
     * @param $pathParam
     */
    protected function log($type, $message, $messageParam, $id = null, $path = null, $pathParam = [])
    {
        $log = $this->logger->newLog();
        $log->setType($type)
            ->setCategory('metadata')
            ->setSubcategory('quarantine')
            ->setOperation('move')
            ->setMessage($message, $messageParam);

        if (!is_null($id)) {
            $log->setIdentifier($id)->setPath($path, $pathParam);
        }

        $this->logger->set($log);
        unset($log);
    }
}
