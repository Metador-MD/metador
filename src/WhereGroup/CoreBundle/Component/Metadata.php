<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Ramsey\Uuid\Uuid;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Twig_Environment;
use Symfony\Component\HttpKernel\KernelInterface;
use WhereGroup\CoreBundle\Component\Metadata\Validator;
use WhereGroup\CoreBundle\Entity\Log;
use WhereGroup\CoreBundle\Entity\MetadataRepository;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;
use WhereGroup\CoreBundle\Entity\Metadata as EntityMetadata;
use WhereGroup\CoreBundle\Event\MetadataLoadFromXmlEvent;
use WhereGroup\PluginBundle\Component\Plugin;
use WhereGroup\UserBundle\Component\UserInterface;
use WhereGroup\UserBundle\Entity\User;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;

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

    /** @var Logger  */
    protected $logger;

    /** @var  Plugin */
    protected $plugin;

    /** @var EventDispatcherInterface */
    protected $eventDispatcher;

    /** @var Twig_Environment */
    protected $templating;

    /** @var KernelInterface */
    protected $kernel;

    /** @var Validator */
    public $validator;

    const ENTITY = 'MetadorCoreBundle:Metadata';

    /**
     * Metadata constructor.
     * @param UserInterface $user
     * @param Logger $logger
     * @param Plugin $plugin
     * @param Validator $validator
     * @param EntityManagerInterface $em
     * @param EventDispatcherInterface $eventDispatcher
     * @param Twig_Environment $templating
     * @param KernelInterface $kernel
     */
    public function __construct(
        UserInterface $user,
        Logger $logger,
        Plugin $plugin,
        Validator $validator,
        EntityManagerInterface $em,
        EventDispatcherInterface $eventDispatcher,
        Twig_Environment $templating,
        KernelInterface $kernel
    ) {
        $this->em              = $em;
        $this->user            = $user;
        $this->logger          = $logger;
        $this->plugin          = $plugin;
        $this->validator       = $validator;
        $this->repo            = $em->getRepository(self::ENTITY);
        $this->eventDispatcher = $eventDispatcher;
        $this->templating      = $templating;
        $this->kernel          = $kernel;
    }

    public function __destruct()
    {
        unset(
            $this->em,
            $this->user,
            $this->logger,
            $this->plugin,
            $this->validator,
            $this->repo,
            $this->eventDispatcher,
            $this->templating,
            $this->kernel
        );
    }

    /**
     * Use ID or UUID
     * @param $id
     * @param bool $dispatchEvent
     * @return EntityMetadata
     * @throws MetadataException
     * @internal param $metadataId
     */
    public function getById($id, $dispatchEvent = true)
    {
        /** @var \WhereGroup\CoreBundle\Entity\Metadata $metadata */
        $metadata = (is_string($id) && strlen($id) === 36)
            ? $this->repo->findOneByUuid($id)
            : $this->repo->findOneById($id);

        if (is_null($metadata)) {
            throw new MetadataException('Datensatz existiert nicht.');
        }

        // EVENT ON LOAD
        if ($dispatchEvent) {
            $this->eventDispatcher->dispatch('metadata.on_load', new MetadataChangeEvent($metadata, array()));
        }

        return $metadata;
    }

    /**
     * @param $parentUuid
     * @return array
     */
    public function getChildren($parentUuid)
    {
        return $this->repo->findBy([
            'parent' => $parentUuid
        ]);
    }

    /**
     * @return mixed
     * @throws NonUniqueResultException
     */
    public function count()
    {
        try {
            return $this->repo->countAll();
        } catch (NoResultException $e) {
            return 0;
        }
    }

    /**
     * @return mixed
     */
    public function countAndGroupBySources()
    {
        return $this->repo->countAndGroupBySources();
    }

    /**
     * @param $p
     * @return string
     * @throws \Exception
     * @throws \Twig_Error_Loader
     * @throws \Twig_Error_Runtime
     * @throws \Twig_Error_Syntax
     */
    public function objectToXml($p)
    {
        $class = $this->plugin->getPluginClassName($p['_profile']);

        $xml = $this->templating->render($class .":Export:metadata.xml.twig", array(
            "p" => $p
        ));

        return $xml;
    }

    /**
     * @param $xml
     * @param $profile
     * @return array|mixed
     * @throws \Exception
     */
    public function xmlToObject($xml, $profile)
    {
        $class  = $this->plugin->getPluginClassName($profile);
        $schema = $this->kernel->locateResource('@' . $class . '/Resources/config/import.json');

        $parser = new XmlParser($xml, new XmlParserFunctions());
        $result = $parser->loadSchema(file_get_contents($schema))->parse();

        $result['p']['_profile'] = $profile;

        $event = new MetadataLoadFromXmlEvent($result['p'], $profile);
        $this->eventDispatcher->dispatch('metadata.load_from_xml', $event);

        return $event->getObject();
    }

    /**
     * @param $string
     * @return array
     */
    public function parseXML($string)
    {
        $parser = new XmlParser($string, new XmlParserFunctions());

        return $parser->loadSchema(file_get_contents(
            $this->kernel->locateResource('@MetadorCoreBundle/Resources/config/import.json')
        ))->parse();
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
        $p['dateStamp'] = $dateStamp->format('Y-m-d');


        // Username
        /** @var User $user */
        $user = $this->getUser($username);
        $p['_username'] = $user->getUsername();

        if (!isset($p['_insert_user'])) {
            $p['_insert_user'] = $p['_username'];
        }

        if (!isset($p['_insert_time'])) {
            $p['_insert_time'] = $p['dateStamp'];
        }

        $p['_update_user'] = $p['_username'];
        $p['_update_time'] = $p['dateStamp'];
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
     * Use id or uuid
     * @param $id
     * @return bool|EntityMetadata
     */
    public function exists($id)
    {
        try {
            return $this->getById($id);
        } catch (MetadataException $e) {
            return false;
        }
    }

    /**
     * Use id or uuid
     * @param $p
     * @param bool $id
     * @param bool $dispatchEvent
     * @param bool $log
     * @return EntityMetadata
     * @throws MetadataException
     * @throws \Exception
     */
    public function saveObject($p, $id = null, $dispatchEvent = true, $log = true)
    {
        if (!is_null($id)) {
            $metadata = $this->getById($id);
        } else {
            $metadata = new EntityMetadata();
            unset($p['_id']);
        }

        $date = new \DateTime($p['dateStamp']);

        $user = $this->user->getByUsername($p['_username']);

        if (!$metadata->getId()) {
            $metadata->setInsertUser($user);
            $metadata->setInsertTime($date->getTimestamp());
        }

        if (isset($p['_parent'])) {
            $metadata->setParent($p['_parent']);
        }

        $metadata->setPublic($p['_public']);
        $metadata->setLocked($p['_locked']);
        $metadata->setUpdateUser($user);
        $metadata->setUpdateTime($date->getTimestamp());
        $metadata->setUuid($p['_uuid']);
        $metadata->setTitle($p['title']);
        $metadata->setAbstract($p['abstract']);
        $metadata->setHierarchyLevel($p['hierarchyLevel']);
        $metadata->setProfile($p['_profile']);
        $metadata->setSearchfield($this->prepareSearchField($p));
        $metadata->setSource($p['_source']);
        $metadata->setDate(new \DateTime($this->findDate($p)));
        $metadata->setDateStamp($date);

        if (!empty($p['bbox'][0]['nLatitude']) && !empty($p['bbox'][0]['eLongitude'])
            && !empty($p['bbox'][0]['sLatitude']) && !empty($p['bbox'][0]['wLongitude'])) {
            $p['bbox'][0]['nLatitude']  = (float)$p['bbox'][0]['nLatitude'];
            $p['bbox'][0]['eLongitude'] = (float)$p['bbox'][0]['eLongitude'];
            $p['bbox'][0]['sLatitude']  = (float)$p['bbox'][0]['sLatitude'];
            $p['bbox'][0]['wLongitude'] = (float)$p['bbox'][0]['wLongitude'];
            $metadata->setBboxn($p['bbox'][0]['nLatitude']);
            $metadata->setBboxe($p['bbox'][0]['eLongitude']);
            $metadata->setBboxs($p['bbox'][0]['sLatitude']);
            $metadata->setBboxw($p['bbox'][0]['wLongitude']);
        }

        $metadata->setObject($p);

        $this->save($metadata, $dispatchEvent, $log);

        return $metadata;
    }

    /**
     * @param $type
     * @param \WhereGroup\CoreBundle\Entity\Metadata $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @param null $path
     * @param array $params
     * @return mixed|void
     */
    public function log($type, $metadata, $operation, $message, $messageParams = array(), $path = null, $params = array())
    {
        /** @var Log $log */
        $log = $this->logger->newLog();
        $log
            ->setType($type)
            ->setCategory('metadata')
            ->setSubcategory('')
            ->setOperation($operation)
            ->setSource($metadata->getSource())
            ->setIdentifier($metadata->getUuid())
            ->setMessage($message, $messageParams)
            ->setUsername($this->user->getUsernameFromSession())
        ;

        if (!is_null($path)) {
            $log
                ->setPath($path)
                ->setParams($params)
            ;
        }
        $this->logger->set($log);
    }

    /**
     * @param $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @param null $path
     * @param array $params
     * @return mixed
     */
    public function success($metadata, $operation, $message, $messageParams = array(), $path = null, $params = array())
    {
        $this->log('success', $metadata, $operation, $message, $messageParams, $path, $params);
    }

    /**
     * @param $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @param null $path
     * @param array $params
     * @return mixed
     */
    public function error($metadata, $operation, $message, $messageParams = array(), $path = null, $params = array())
    {
        $this->log('error', $metadata, $operation, $message, $messageParams);
    }

    /**
     * @param $id
     * @return mixed|void
     * @throws MetadataException
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


        $this->save($entity, false, false);

        $this->success($entity, 'lock', '%title% gesperrt.', array(
            '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
        ), 'metadata_edit', array('profile' => $entity->getProfile(), 'id' => $entity->getId()));
    }

    /**
     * Use ID or UUID to unlock Metadata.
     * @param $id
     * @return mixed|void
     * @throws MetadataException
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
            '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
        ), 'metadata_edit', array('profile' => $entity->getProfile(), 'id' => $entity->getId()));
    }

    /**
     * Use ID or UUID to delete Metadata.
     * @param $id
     * @return void
     * @throws MetadataException
     */
    public function deleteById($id)
    {
        $metadata = $this->getById($id);

        // EVENT PRE DELETE
        $event = new MetadataChangeEvent($metadata, array());
        $this->eventDispatcher->dispatch('metadata.pre_delete', $event);

        foreach ($metadata->getGroups() as $group) {
            $metadata->removeGroups($group);
        }

        $this->success($metadata, 'delete', '%title% gelöscht.', array(
            '%title%' => $metadata->getTitle() !== '' ? $metadata->getTitle() : 'Datensatz'
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
     * @param bool $log
     * @return bool
     */
    public function save($entity, $dispatchEvent = true, $log = true)
    {
        $operation = 'create';

        if ($entity->getInsertTime() != $entity->getUpdateTime()) {
            $operation = 'update';
        }

        // SAVE TO DATABASE
        $this->em->beginTransaction();
        $success = false;
        $event = new MetadataChangeEvent($entity, array());

        try {
            // EVENT PRE SAVE
            if ($dispatchEvent) {
                $this->eventDispatcher->dispatch('metadata.pre_save', $event);
            }

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
            // EVENT POST SAVE
            if ($dispatchEvent) {
                $this->eventDispatcher->dispatch('metadata.post_save', $event);
            }

            if ($log) {
                $this->success($entity, $operation, '%title% gespeichert.', array(
                    '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
                ), 'metadata_edit', array('profile' => $entity->getProfile(), 'id' => $entity->getId()));
            }

            return true;
        }

        if ($log) {
            $this->error($entity, $operation, '%title% konnte nicht gespeichert werden.', array(
                '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
            ), 'metadata_edit', array('profile' => $entity->getProfile(), 'id' => $entity->getId()));
        }

        return false;
    }

    /**
     * @return \Doctrine\Common\Persistence\ObjectRepository|MetadataRepository
     */
    public function getRepository()
    {
        return $this->repo;
    }

    /**
     * @return EntityManagerInterface
     */
    public function getEntityManager()
    {
        return $this->em;
    }

    /**
     * @param $p
     * @return string
     */
    protected function prepareSearchField($p)
    {
        $searchfield  = '';
        $fields = ['_searchfield', 'title', 'alternateTitle', 'abstract'];

        foreach ($fields as $field) {
            $value = ArrayParser::get($p, $field, '');

            if (is_array($value) && !empty($value)) {
                $temp = '';

                foreach ($value as $row) {
                    if (is_string($row) && !empty($row)) {
                        $temp .= ' ' . $row;
                    }
                }

                $value = trim($temp);
                unset($temp);
            }
            $searchfield .= trim($value);
        }

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

        return null;
    }
}
