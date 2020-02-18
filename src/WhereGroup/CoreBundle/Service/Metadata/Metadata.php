<?php

namespace WhereGroup\CoreBundle\Service\Metadata;

use Exception;
use Plugins\WhereGroup\ImportBundle\Entity\ImportExport;
use Ramsey\Uuid\Builder\DefaultUuidBuilder;
use RuntimeException;
use Doctrine\Common\Persistence\ObjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataExistsException;
use WhereGroup\CoreBundle\Component\Metadata\PrepareMetadata;
use WhereGroup\CoreBundle\Component\Utils\Debug;
use WhereGroup\CoreBundle\Entity\Metadata as MetadataEntity;
use WhereGroup\CoreBundle\Entity\MetadataRepository;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;
use WhereGroup\CoreBundle\Service\App;
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

    /** @var ObjectRepository|MetadataRepository  */
    protected $repo;

    /** @var EventDispatcherInterface */
    protected $eventDispatcher;

    /** @var EntityManagerInterface */
    protected $em;

    /** @var App */
    protected $app;

    /** @var UserInterface  */
    protected $user;

    const ENTITY = 'MetadorCoreBundle:Metadata';

    /**
     * Metadata constructor.
     * @param MetadataXmlProcessor $processor
     * @param EntityManagerInterface $em
     * @param EventDispatcherInterface $eventDispatcher
     * @param App $app
     * @param UserInterface $user
     */
    public function __construct(
        MetadataXmlProcessor $processor,
        EntityManagerInterface $em,
        EventDispatcherInterface $eventDispatcher,
        App $app,
        UserInterface $user
    ) {
        $this->processor = $processor;
        $this->em = $em;
        $this->eventDispatcher = $eventDispatcher;
        $this->repo = $em->getRepository(self::ENTITY);
        $this->app = $app;
        $this->user = $user;
    }

    public function __destruct()
    {
        unset(
            $this->processor,
            $this->em,
            $this->eventDispatcher,
            $this->repo,
            $this->app,
            $this->user
        );
    }

    /**
     * @param $id
     * @return null|MetadataEntity
     */
    public function findById($id)
    {
        return $this->repo->findOneById($id);
    }

    /**
     * @param string $xml
     * @param ImportExport $config
     * @return MetadataEntity
     * @throws Exception
     */
    public function processXml(string $xml, ImportExport $config)
    {
        $object  = $this->processor->processByMapping($xml, $config->getProfileMapping());
        $options = [
            'source'   => $config->getSource(),
            'username' => $config->getUsername(),
            'dispatchEvent' => false, // remove later
            'public'   => true,
            'flush'    => true, // change to false
            'log'      => false
        ];
        $this->setDefaultOptionValues($options);

        Debug::append(print_r($options, true));

        try {
            if ($this->findById($object['_uuid']) && $config->getRemoveDataOnDestination()) {
                return $this->updateByObject($object, $options);
            }
            return $this->insertByObject($object, $options);
        } catch (MetadataExistsException $e) {
            Debug::append("Exception: " . $e->getMessage());
        }
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
            $this->eventDispatcher->dispatch('metadata.pre_save', $event);
        }

        $this->em->persist($metadata);

        if (isset($options['flush']) && $options['flush'] === true) {
            $this->em->flush();
            $this->em->clear();
        }

        if ($options['dispatchEvent'] === true) {
            $this->eventDispatcher->dispatch('metadata.post_save', $event);
        }

        return $metadata;
    }

    /**
     * @param $options
     * @return array
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
