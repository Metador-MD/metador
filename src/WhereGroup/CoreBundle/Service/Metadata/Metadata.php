<?php

namespace WhereGroup\CoreBundle\Service\Metadata;

use DateTime;
use Exception;
use Ramsey\Uuid\Uuid;
use RuntimeException;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use WhereGroup\AddressBundle\Component\Address;
use WhereGroup\CoreBundle\Component\Configuration;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataExistsException;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataNotFoundException;
use WhereGroup\CoreBundle\Component\Logger;
use WhereGroup\CoreBundle\Component\Metadata\PrepareMetadata;
use WhereGroup\CoreBundle\Component\Metadata\Validator;
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
    /** @var Database */
    public $db;

    /** @var App */
    protected $app;

    /** @var Address */
    protected $address;

    /** @var MetadataXmlProcessor */
    protected $processor;

    /** @var EventDispatcherInterface */
    protected $eventDispatcher;

    /** @var UserInterface */
    protected $user;

    /** @var Logger */
    protected $logger;

    /** @var Validator */
    public $validator;

    /** @var Configuration */
    public $configuration;

    /**
     * Metadata constructor.
     * @param MetadataXmlProcessor $processor
     * @param EventDispatcherInterface $eventDispatcher
     * @param App $app
     * @param UserInterface $user
     * @param Logger $logger
     * @param Database $db
     * @param Address $address
     * @param Validator $validator
     * @param Configuration $configuration
     */
    public function __construct(
        MetadataXmlProcessor $processor,
        EventDispatcherInterface $eventDispatcher,
        App $app,
        UserInterface $user,
        Logger $logger,
        Database $db,
        Address $address,
        Validator $validator,
        Configuration $configuration
    ) {
        $this->processor = $processor;
        $this->eventDispatcher = $eventDispatcher;
        $this->app = $app;
        $this->user = $user;
        $this->logger = $logger;
        $this->db = $db;
        $this->address = $address;
        $this->validator = $validator;
        $this->configuration = $configuration;
    }

    public function __destruct()
    {
        unset(
            $this->processor,
            $this->eventDispatcher,
            $this->app,
            $this->user,
            $this->logger,
            $this->db,
            $this->address,
            $this->validator,
            $this->configuration
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
     * @param bool $dispatchEvent
     * @return null|MetadataEntity
     */
    public function findById($id, $dispatchEvent = true)
    {
        if (empty($id)) {
            return null;
        }

        $entity = $this->db->getRepository()->findOneById($id);

        if ($entity instanceof MetadataEntity && $dispatchEvent) {
            $this->eventDispatcher->dispatch('metadata.on_load', new MetadataChangeEvent($entity, []));
        }

        return $entity;
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
            throw new MetadataExistsException("Datensatz " . $object['_uuid'] . " existiert bereits.");
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
     * @throws Exception
     */
    public function prepareObjectForUpdate(array $object, array $options = []): MetadataEntity
    {
        $this->setDefaultOptionValues($options);

        $metadata = $this->findById($object['_uuid']);

        if (is_null($metadata)) {
            throw new MetadataNotFoundException("Datensatz mit der UUID" . $object['_uuid'] . " nicht gefunden.");
        }

        $oldObject = $metadata->getObject();
        // Todo: why oldObject?
        $object['_insert_user'] = $oldObject['_username'];
        $object['_insert_time'] = $oldObject['dateStamp'];

        $date = new DateTime($object['_insert_time']);

        $metadata
            ->setInsertUser($this->app->getUser($object['_insert_user']))
            ->setInsertTime($date->getTimestamp())
        ;

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
     * @throws Exception
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
    public function save(MetadataEntity $metadata, array $options): MetadataEntity
    {
        return $this->saveRaw($metadata, $options);
    }

    /**
     * @param MetadataEntity $metadata
     * @param array $options
     * @return MetadataEntity
     */
    protected function saveRaw(MetadataEntity $metadata, array $options): MetadataEntity
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
            if (isset($options['flush']) && $options['flush'] === true) {
                $this->db->dispatchFlush();
            }
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
        $options['raw']           = $options['raw']           ?? false;
    }

    /**
     * @param MetadataEntity $entity
     * @return Metadata
     * @throws Exception
     */
    public function lock(MetadataEntity $entity)
    {
        $p = $entity->getObject();
        $p['_locked'] = true;
        $p['_lock_user'] = $this->user->getUsernameFromSession();
        $p['_lock_time'] = (new DateTime())->getTimestamp();

        $entity
            ->setLocked(true)
            ->setLockUser($this->user->getUserFromSession())
            ->setLockTime((new DateTime())->getTimestamp())
            ->setObject($p);

        $this->saveRaw($entity, [ 'dispatchEvent' => false ]);

        $this->log('success', 'lock', $entity, '%title% gesperrt.', [
            '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
        ]);

        return $this;
    }

    /**
     * Use ID or UUID to unlock Metadata.
     * @param MetadataEntity $entity
     * @return mixed|void
     */
    public function unlock(MetadataEntity $entity)
    {
        $p = $entity->getObject();
        $p['_locked'] = false;

        $entity
            ->setLocked(false)
            ->setObject($p)
        ;

        $this->saveRaw($entity, [ 'dispatchEvent' => false ]);

        $this->log('success', 'unlock', $entity, '%title% freigegeben.', [
            '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
        ]);
    }

    /**
     * @param MetadataEntity $entity
     * @param bool $dispatchEvent
     * @param bool $flush
     * @param bool $log
     */
    public function delete(MetadataEntity $entity, $dispatchEvent = true, $flush = true, $log = true)
    {
        if ($dispatchEvent) {
            $this->db->dispatchPreDelete(new MetadataChangeEvent($entity, []));
        }

        foreach ($entity->getGroups() as $group) {
            $entity->removeGroups($group);
        }

        foreach ($entity->getAddress() as $address) {
            $entity->removeAddress($address);
        }

        if ($log) {
            $this->log('success', 'delete', $entity, '%title% gelöscht.', [
                '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
            ], $flush);
        }

        $this->db->delete($entity);

        if ($flush) {
            $this->db->dispatchFlush();
        }
    }

    /**
     * @param array $source
     * @param array $target
     */
    public function mergeSystemInformations(array $source, array &$target)
    {
        foreach ($source as $key => $value) {
            if (substr($key, 0, 1) === '_') {
                $target[$key] = $value;
            }
        }
    }

    /**
     * @param $type
     * @param $operation
     * @param MetadataEntity $entity
     * @param $message
     * @param array $params
     * @param $flush
     */
    public function log($type, $operation, $entity, $message, $params = [], $flush = true)
    {
        $log = $this->logger->newLog();
        $log
            ->setType($type)
            ->setCategory('metadata')
            ->setSubcategory('')
            ->setOperation($operation)
            ->setSource(!is_null($entity) ? $entity->getSource() : '')
            ->setIdentifier(!is_null($entity) ? $entity->getId() : '')
            ->setMessage($message, $params);

        $this->logger->set($log, $flush);
    }


    /**
     * @return string
     * @throws MetadataException
     */
    public function generateUuid()
    {
        try {
            $uuid4 = Uuid::uuid4();
            return $uuid4->toString();
        } catch (Exception $e) {
            $message = 'Beim erzeugen der UUID ist ein Fehler unterlaufen';
            $log = $this->logger->newLog();
            $log
                ->setType('error')
                ->setCategory('metadata')
                ->setSubcategory('uuid')
                ->setOperation('generate')
                ->setMessage($message);

            $this->logger->set($log);

            throw new MetadataException($message);
        }
    }
}
