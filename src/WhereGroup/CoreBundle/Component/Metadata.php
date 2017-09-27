<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Rhumsaa\Uuid\Uuid;
use WhereGroup\CoreBundle\Entity\MetadataRepository;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;
use WhereGroup\CoreBundle\Entity\Metadata as EntityMetadata;
use WhereGroup\PluginBundle\Component\Plugin;
use WhereGroup\UserBundle\Component\UserInterface;
use WhereGroup\UserBundle\Entity\User;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;

/**
 * Class Metadata
 * @package WhereGroup\CoreBundle\Component
 * @author A. R. Pour
 */
class Metadata implements MetadataInterface
{
    /** @var UserInterface  */
    protected $user;

    /** @var \Doctrine\Common\Persistence\ObjectRepository|MetadataRepository  */
    protected $repo;

    /** @var EntityManagerInterface */
    protected $em;

    /** @var Core  */
    protected $core;

    /** @var Logger  */
    protected $logger;

    /** @var  Plugin */
    protected $plugin;

    const ENTITY = 'MetadorCoreBundle:Metadata';

    /**
     * Metadata constructor.
     * @param Core $core
     * @param UserInterface $user
     * @param Logger $logger
     * @param EntityManagerInterface $em
     * @param Plugin $plugin
     */
    public function __construct(
        Core $core,
        UserInterface $user,
        Logger $logger,
        EntityManagerInterface $em,
        Plugin $plugin
    ) {
        $this->em = $em;
        $this->core = $core;
        $this->user = $user;
        $this->logger = $logger;
        $this->repo = $em->getRepository(self::ENTITY);
        $this->plugin = $plugin;
    }

    public function __destruct()
    {
        unset(
            $this->core,
            $this->user,
            $this->repo,
            $this->logger,
            $this->em,
            $this->plugin
        );
    }

    /**
     * @param $metadataId
     * @param bool $dispatchEvent
     * @return EntityMetadata
     * @throws \Exception
     */
    public function getById($metadataId, $dispatchEvent = true)
    {
        /** @var \WhereGroup\CoreBundle\Entity\Metadata $metadata */
        $metadata = $this->repo->findOneById($metadataId);

        if (is_null($metadata)) {
            throw new MetadataException('Datensatz existiert nicht.');
        }

        // EVENT ON LOAD
        if ($dispatchEvent) {
            $this->core->dispatch('metadata.on_load', new MetadataChangeEvent($metadata, array()));
        }

        return $metadata;
    }

    /**
     * @param $p
     * @return string
     */
    public function objectToXml($p)
    {
        $class = $this->plugin->getPluginClassName($p['_profile']);

        $xml = $this->core->render($class .":Export:metadata.xml.twig", array(
            "p" => $p
        ));

        return $xml;
    }

    /**
     * @param $xml
     * @param $profile
     * @return array|mixed
     */
    public function xmlToObject($xml, $profile)
    {
        $class  = $this->plugin->getPluginClassName($profile);
        $schema = $this->core->locateResource('@' . $class . '/Resources/config/import.json');

        $parser = new XmlParser($xml, new XmlParserFunctions());
        $result = $parser->loadSchema(file_get_contents($schema))->parse();

        return $result['p'];
    }

    /**
     * @param string $uuid
     * @param bool $dispatchEvent
     * @return EntityMetadata
     * @throws \Exception
     */
    public function getByUUID($uuid, $dispatchEvent = true)
    {
        /** @var \WhereGroup\CoreBundle\Entity\Metadata $metadata */
        $metadata = $this->repo->findOneByUuid($uuid);

        if (is_null($metadata)) {
            throw new MetadataException('Datensatz existiert nicht.');
        }

        // EVENT ON LOAD
        if ($dispatchEvent) {
            $this->core->dispatch('metadata.on_load', new MetadataChangeEvent($metadata, array()));
        }

        return $metadata;
    }

    /**
     * @param $p
     * @param null $source
     * @param null $profile
     * @param null $username
     * @param null $public
     * @return $this|mixed
     * @throws MetadataException
     */
    public function updateObject(&$p, $source = null, $profile = null, $username = null, $public = null)
    {
        if (!is_null($profile)) {
            $p['_profile'] = $profile;
        }

        if (!is_null($source)) {
            $p['_source'] = $source;
        }

        if (!is_null($public)) {
            $p['_public'] = (boolean)$public;
        } elseif (!isset($p['_public'])) {
            $p['_public'] = false;
        }

        if (empty($p['_profile'])) {
            throw new MetadataException("Profil nicht gefunden");
        }

        if (empty($p['_source'])) {
            throw new MetadataException("Datenquelle nicht gefunden");
        }

        // DateStamp
        $dateStamp = new \DateTime();
        $p['_dateStamp'] = $dateStamp->format('Y-m-d');


        // Username
        /** @var User $user */
        $user = $this->getUser($username);
        $p['_username'] = $user->getUsername();

        if (!isset($p['_insert_user'])) {
            $p['_insert_user'] = $p['_username'];
        }

        if (!isset($p['_insert_time'])) {
            $p['_insert_time'] = $p['_dateStamp'];
        }

        $p['_update_user'] = $p['_username'];
        $p['_update_time'] = $p['_dateStamp'];
        $p['_groups']      = !isset($p['_groups']) || !is_array($p['_groups']) ? array() : $p['_groups'];

        // UUID
        $uuid4 = Uuid::uuid4();
        $uuid = $uuid4->toString();

        if (isset($p['fileIdentifier']) && !empty($p['fileIdentifier']) && strlen($p['fileIdentifier']) === 36) {
            $uuid = $p['fileIdentifier'];
        } elseif (isset($p['_uuid']) && !empty($p['_uuid']) && strlen($p['_uuid']) === 36) {
            $uuid = $p['_uuid'];
        }

        $p['_uuid'] = $p['fileIdentifier'] = $uuid;

        // Locked
        if (isset($p['_remove_lock']) || !isset($p['_locked'])) {
            $p['_locked'] = false;
        } else {
            $p['_locked'] = (boolean)$p['_locked'];
        }

        // Title
        $p['title'] = isset($p['title']) ? $p['title'] : '';
        $p['abstract'] = isset($p['abstract']) ? $p['abstract'] : '';
        $p['hierarchyLevel'] = isset($p['hierarchyLevel']) ? $p['hierarchyLevel'] : '';

        return $this;
    }

    /**
     * @param $uuid
     * @return bool|EntityMetadata
     */
    public function exists($uuid)
    {
        try {
            return $this->getByUUID($uuid);
        } catch (MetadataException $e) {
            return false;
        }
    }

    /**
     * @param $p
     * @param bool $id
     * @param null $uuid
     * @return EntityMetadata
     */
    public function saveObject($p, $id = null, $uuid = null)
    {
        if (!is_null($id)) {
            $metadata = $this->getById($id);
        } elseif (!is_null($uuid)) {
            $metadata = $this->getByUUID($uuid);
        } else {
            $metadata = new EntityMetadata();
            unset($p['_id']);
        }

        $date = new \DateTime($p['_dateStamp']);

        $user = $this->user->getByUsername($p['_username']);

        if (!$metadata->getId()) {
            $metadata->setInsertUser($user);
            $metadata->setInsertTime($date->getTimestamp());
        }

        $metadata->setPublic($p['_public']);
        $metadata->setLocked($p['_locked']);
        $metadata->setUpdateUser($user);
        $metadata->setUpdateTime($date->getTimestamp());
        $metadata->setUuid($p['_uuid']);
        $metadata->setTitle($p['title']);
        $metadata->setAbstract($p['abstract']);
        $metadata->setObject($p);
        $metadata->setHierarchyLevel($p['hierarchyLevel']);
        $metadata->setProfile($p['_profile']);
        $metadata->setSearchfield($this->prepareSearchField($p));
        $metadata->setSource($p['_source']);
        $metadata->setDate(new \DateTime($this->findDate($p)));

        if (!empty($p['bbox'][0]['nLatitude'])) {
            $metadata->setBboxn((float)$p['bbox'][0]['nLatitude']);
            $metadata->setBboxe((float)$p['bbox'][0]['eLongitude']);
            $metadata->setBboxs((float)$p['bbox'][0]['sLatitude']);
            $metadata->setBboxw((float)$p['bbox'][0]['wLongitude']);
        }

        $this->save($metadata);

        return $metadata;
    }

    /**
     * @param $type
     * @param \WhereGroup\CoreBundle\Entity\Metadata $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @return mixed|void
     */
    public function log($type, $metadata, $operation, $message, $messageParams = array())
    {
        $log = $this->logger->newLog();
        $log
            ->setType($type)
            ->setCategory('metadata')
            ->setSubcategory('')
            ->setOperation($operation)
            ->setSource($metadata->getSource())
            ->setIdentifier($metadata->getUuid())
            ->setMessage($message, $messageParams)
            ->setUser($metadata->getUpdateUser());
        $this->logger->set($log);
    }

    /**
     * @param $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @return mixed
     */
    public function success($metadata, $operation, $message, $messageParams = array())
    {
        $this->log('success', $metadata, $operation, $message, $messageParams);
    }

    /**
     * @param $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @return mixed
     */
    public function error($metadata, $operation, $message, $messageParams = array())
    {
        $this->log('error', $metadata, $operation, $message, $messageParams);
    }

    /**
     * @param $id
     * @return mixed|void
     */
    public function lock($id)
    {
        $entity = $this->getById($id, false);

        // Update DataObject
        $p = $entity->getObject();
        $p['_locked'] = true;
        $p['_lock_user'] = $this->user->getUserFromSession()->getUsername();
        $p['_lock_time'] = $this->getTimestamp();
        $entity->setObject($p);

        // Update Table
        $entity
            ->setLocked(true)
            ->setLockUser($this->user->getUserFromSession())
            ->setLockTime($this->getTimestamp());


        $this->save($entity, false);

        $this->success($entity, 'lock', '%title% gesperrt.', array(
            'title' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
        ));
    }

    /**
     * @param $id
     * @return mixed|void
     */
    public function unlock($id)
    {
        $entity = $this->getById($id, false);

        // Update DataObject
        $p = $entity->getObject();
        $p['_locked'] = false;
        $entity->setObject($p);

        // Update Table
        $entity->setLocked(false);

        $this->save($entity, false);

        $this->success($entity, 'unlock', '%title% freigegeben.', array(
            'title' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
        ));
    }

    /**
     * @param $id
     * @return bool
     */
    public function deleteById($id)
    {
        $metadata = $this->getById($id);

        // EVENT PRE DELETE
        $event = new MetadataChangeEvent($metadata, array());
        $this->core->dispatch('metadata.pre_delete', $event);

        foreach ($metadata->getGroups() as $group) {
            $metadata->removeGroups($group);
        }

        $this->success($metadata, 'unlock', '%title% gelöscht.', array(
            'title' => $metadata->getTitle() !== '' ? $metadata->getTitle() : 'Datensatz'
        ));

        // DELETE
        $this->em->persist($metadata);
        $this->em->flush();
        $this->em->remove($metadata);
        $this->em->flush();
    }

    /**
     * @param \WhereGroup\CoreBundle\Entity\Metadata $entity
     * @param bool $dispatchEvent
     * @return bool
     */
    public function save($entity, $dispatchEvent = true)
    {
        // EVENT PRE SAVE
        if ($dispatchEvent) {
            $event  = new MetadataChangeEvent($entity, array());
            $this->core->dispatch('metadata.pre_save', $event);
        }

        // SAVE TO DATABASE
        $this->em->beginTransaction();
        $success = false;

        try {
            $hasId = $entity->getId();

            $this->em->persist($entity);
            $this->em->flush();

            if (!$hasId) {
                $p = $entity->getObject();
                $p['_id'] = $entity->getId();
                $entity->setObject($p);
                $this->em->persist($entity);
                $this->em->flush();
            }

            $this->em->commit();

            $success = true;
        } catch (\Exception $e) {
            $this->em->rollBack();
        }

        if ($success) {
            $this->success($entity, 'update', '%title% gespeichert.', array(
                'title' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
            ));

            // EVENT POST SAVE
            if ($dispatchEvent) {
                $this->core->dispatch('metadata.post_save', $event);
            }

            return true;
        }

        $this->error($entity, 'update', '%title% konnte nicht gespeichert werden.', array(
            'title' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
        ));

        return false;
    }

    /**
     * @param $p
     * @return string
     */
    protected function prepareSearchField($p)
    {
        $searchfield  = '';
        $searchfield .= isset($p['_searchfield']) ? ' ' . strtolower($p['_searchfield']) : '';
        $searchfield .= isset($p['title'])        ? ' ' . strtolower($p['title']) : '';
        $searchfield .= isset($p['alternateTitle']) ? ' ' . strtolower($p['alternateTitle']) : '';
        $searchfield .= isset($p['abstract'])     ? ' ' . strtolower($p['abstract']) : '';

        if (isset($p['keyword'])) {
            foreach ($p['keyword'] as $value) {
                if (isset($value['value']) && !empty($value['value'])) {
                    foreach ($value['value'] as $keyword) {
                        $searchfield .= ' ' . strtolower($keyword);
                    }
                }
            }
        }

        return trim($searchfield);
    }

    /**
     * @param $username
     * @return mixed
     */
    private function getUser($username)
    {
        return is_null($username)
            ? $this->user->getUserFromSession()
            : $this->user->getByUsername($username);
    }

    /**
     * @return int
     */
    private function getTimestamp()
    {
        $dateTime = new \DateTime();

        return $dateTime->getTimestamp();
    }

    /**
     * @param $metadataObject
     * @return mixed
     * @throws \Exception
     */
    private function findDate($metadataObject)
    {
        if (!empty($metadataObject['revisionDate'])) {
            return $metadataObject['revisionDate'];
        }

        if (!empty($metadataObject['publicationDate'])) {
            return $metadataObject['publicationDate'];
        }

        if (!empty($metadataObject['creationDate'])) {
            return $metadataObject['creationDate'];
        }

        if (empty($metadataObject['_dateStamp'])) {
            throw new \Exception("dateStamp empty!");
        }

        return $metadataObject['_dateStamp'];
    }
}
