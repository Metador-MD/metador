<?php

namespace WhereGroup\CoreBundle\Service\Metadata;

use Exception;
use RuntimeException;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataExistsException;
use WhereGroup\CoreBundle\Component\Logger;
use WhereGroup\CoreBundle\Component\Metadata\PrepareMetadata;
use WhereGroup\CoreBundle\Entity\Metadata as MetadataEntity;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;
use WhereGroup\CoreBundle\Service\App;
use WhereGroup\CoreBundle\Service\Database;
use WhereGroup\UserBundle\Component\UserInterface;
use WhereGroup\UserBundle\Entity\User;

/**
 * Class Metadata
 * @package WhereGroup\CoreBundle\Service\Metadata
 */
class Metadata
{
    /** @var MetadataXmlProcessor */
    protected $processor;

    /** @var EventDispatcherInterface */
    protected $eventDispatcher;

    /** @var App */
    protected $app;

    /** @var UserInterface */
    protected $user;

    /** @var Logger */
    protected $logger;

    /** @var Database */
    public $db;

    /**
     * Metadata constructor.
     * @param MetadataXmlProcessor $processor
     * @param EventDispatcherInterface $eventDispatcher
     * @param App $app
     * @param UserInterface $user
     * @param Logger $logger
     * @param Database $db
     */
    public function __construct(
        MetadataXmlProcessor $processor,
        EventDispatcherInterface $eventDispatcher,
        App $app,
        UserInterface $user,
        Logger $logger,
        Database $db
    ) {
        $this->processor = $processor;
        $this->eventDispatcher = $eventDispatcher;
        $this->app = $app;
        $this->user = $user;
        $this->logger = $logger;
        $this->db = $db;
    }

    public function __destruct()
    {
        unset(
            $this->processor,
            $this->eventDispatcher,
            $this->app,
            $this->user,
            $this->logger,
            $this->db
        );
    }

    /**
     * @return MetadataXmlProcessor
     */
    public function getProcessor()
    {
        return $this->processor;
    }

    /**
     * @param $id
     * @return null|MetadataEntity
     */
    public function findById($id)
    {
        return $this->db->getRepository()->findOneById($id);
    }

    /**
     * @param array $object
     * @param array $options
     * @return MetadataEntity
     * @throws MetadataExistsException
     * @throws Exception
     */
    public function prepareObjectForInsert(array $object, array $options = []): MetadataEntity
    {
        $this->setDefaultOptionValues($options);

        $metadata = new MetadataEntity();

        if (empty($object['_uuid'])) {
            $object['_uuid'] = $object['fileIdentifier'] = $this->app->generateUuid();
        }

        if ($this->findById($object['_uuid'])) {
            throw new MetadataExistsException("Datensatz existiert bereits.");
        }

        $metadata->setObject($object);

        return PrepareMetadata::prepareInsert(
            $metadata,
            $this->findUser($object, $options),
            $options,
            $this->user
        );
    }

    /**
     * @param array $object
     * @param array $options
     * @return MetadataEntity
     * @throws MetadataExistsException
     * @throws Exception
     */
    public function prepareObjectForUpdate(array $object, array $options = []): MetadataEntity
    {
        $this->setDefaultOptionValues($options);

        $metadata = $this->findById($object['_uuid']);

        if ($options['source'] !== $metadata->getSource()) {
            throw new MetadataExistsException("Datensatz existiert bereits in einer anderen Datenquelle.");
        }

        $metadata->setObject($object);

        return PrepareMetadata::prepareUpdate(
            $metadata,
            $this->findUser($object, $options),
            $options,
            $this->user
        );
    }

    /**
     * @param array $object
     * @param array $options
     * @return MetadataEntity
     * @throws Exception
     */
    public function insertByObject(array $object, array $options = []): MetadataEntity
    {
        return $this->save($this->prepareObjectForInsert($object, $options), $options);
    }

    /**
     * @param array $object
     * @param array $options
     * @return MetadataEntity
     * @throws MetadataExistsException
     */
    public function updateByObject(array $object, array $options = []): MetadataEntity
    {
        return $this->save($this->prepareObjectForUpdate($object, $options), $options);
    }

    /**
     * @param array $p
     * @param array $options
     * @return User
     */
    public function findUser(array $p, array $options): User
    {
        $user = $this->app->getUser($options['username']);

        if (!$user) {
            $user = $this->app->getUser($p['_username']);
        }

        if (!$user) {
            throw new RuntimeException("User not found.");
        }

        return $user;
    }

    /**
     * @param MetadataEntity $metadata
     * @param array $options
     * @return MetadataEntity
     */
    protected function save(MetadataEntity $metadata, array $options): MetadataEntity
    {
        $this->setDefaultOptionValues($options);

        if ($options['dispatchEvent'] === true) {
            $event = new MetadataChangeEvent($metadata, [
                'log'   => $options['log'],
                'flush' => $options['flush']
            ]);
            $this->db->dispatchPreSave($event);
        }

        $this->db->persist($metadata);

        if (isset($options['flush']) && $options['flush'] === true) {
            $this->db->dispatchFlush();
        }

        if ($options['dispatchEvent'] === true) {
            $this->db->dispatchPostSave($event);
        }

        return $metadata;
    }

    /**
     * @param $options
     * @return void
     */
    protected function setDefaultOptionValues(&$options)
    {
        $options['source']        = $options['source']        ?? null;
        $options['profile']       = $options['profile']       ?? null;
        $options['username']      = $options['username']      ?? null;
        $options['public']        = $options['public']        ?? null;
        $options['dispatchEvent'] = $options['dispatchEvent'] ?? true;
        $options['log']           = $options['log']           ?? true;
        $options['flush']         = $options['flush']         ?? true;
    }
}