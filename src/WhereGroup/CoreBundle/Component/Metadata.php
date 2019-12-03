<?php

namespace WhereGroup\CoreBundle\Component;

use DateTime;
use Doctrine\Common\Persistence\ObjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use DOMDocument;
use DOMXPath;
use Exception;
use Ramsey\Uuid\Uuid;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Twig_Environment;
use Symfony\Component\HttpKernel\KernelInterface;
use Twig_Error_Loader;
use Twig_Error_Runtime;
use Twig_Error_Syntax;
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

    /** @var ObjectRepository|MetadataRepository  */
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
        /** @var EntityMetadata $metadata */
        $metadata = $this->repo->findOneById($id);

        if (is_null($metadata)) {
            throw new MetadataException('Datensatz existiert nicht.');
        }

        // EVENT ON LOAD
        if ($dispatchEvent) {
            $this->eventDispatcher->dispatch('metadata.on_load', new MetadataChangeEvent($metadata, []));
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
     * @throws Exception
     * @throws Twig_Error_Loader
     * @throws Twig_Error_Runtime
     * @throws Twig_Error_Syntax
     */
    public function objectToXml($p)
    {
        $class = $this->plugin->getPluginClassName($p['_profile']);

        $xml = $this->templating->render($class .":Export:metadata.xml.twig", [
            "p" => $p
        ]);

        return $xml;
    }

    /**
     * @param $xml
     * @param $profile
     * @return array|mixed
     * @throws Exception
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
     * @return EntityMetadata
     * @throws MetadataException
     * @throws Exception
     */
    public function prepareData(&$p, $source = null, $profile = null, $username = null, $public = null)
    {
        if (!empty($p['_uuid'])) {
            $metadata = $this->getById($p['_uuid']);
        } else {
            $metadata = new EntityMetadata();
            unset($p['_uuid']);
        }

        $user = $this->getUser($username);

        if (!$user) {
            $user = $this->user->getByUsername($p['_username']);
        }

        if (!$user) {
            throw new MetadataException("Benutzer nicht gefunden.");
        }

        $this->updateObjectInformation($p, $source, $profile, $user->getUsername(), $public);

        $date = new DateTime($p['dateStamp']);

        if (!$metadata->getId()) {
            $metadata->setInsertUser($user);
            $metadata->setInsertTime($date->getTimestamp());
        }

        if (isset($p['parentIdentifier'])) {
            $metadata->setParent($p['parentIdentifier']);
        }

        if (isset($p['topicCategory'])) {
            $metadata->setTopicCategory(implode(" ", $p['topicCategory']));
        }

        $metadata->setId($p['_uuid']);
        $metadata->setPublic($p['_public']);
        $metadata->setLocked($p['_locked']);
        $metadata->setUpdateUser($user);
        $metadata->setUpdateTime($date->getTimestamp());
        $metadata->setTitle($p['title'] !== '' ? $p['title'] : 'noname');
        $metadata->setAbstract($p['abstract']);
        $metadata->setHierarchyLevel($p['hierarchyLevel']);
        $metadata->setProfile($p['_profile']);
        $metadata->setSearchfield($this->prepareSearchField($p));
        $metadata->setSource($p['_source']);
        $metadata->setDate(is_null($p['_date']) || !is_string($p['_date']) ? null : new DateTime($p['_date']));
        $metadata->setDateStamp(
            is_null($p['dateStamp']) || !is_string($p['dateStamp'])
                ? null
                : new DateTime($p['dateStamp'])
        );
        $metadata->setInsertUsername($p['_insert_user']);

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

        // Set groups
        $metadata->clearGroups();

        foreach ($p['_groups'] as $key => $name) {
            $group = $this->user->getGroupByName($name);

            if (!$group) {
                unset($p['_groups'][$key]);
                continue;
            }

            $metadata->addGroups($group);
        }

        $metadata->setObject($p);

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
     * @throws Exception
     */
    public function updateObjectInformation(&$p, $source = null, $profile = null, $username = null, $public = null)
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
        $dateStamp = new DateTime();
        $p['dateStamp'] = $dateStamp->format('Y-m-d');
        $p['_date'] = null;

        if (!is_null($this->findDate($p))) {
            $p['_date'] = $this->findDate($p);
        }

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
        $p['_groups']      = !isset($p['_groups']) || !is_array($p['_groups']) ? [] : $p['_groups'];

        // UUID
        $uuid = $this->generateUuid();

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
     * @return string
     * @throws Exception
     */
    public function generateUuid()
    {
        $uuid4 = Uuid::uuid4();
        return $uuid4->toString();
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
     * @param array $options
     * @return EntityMetadata
     * @throws Exception
     */
    public function saveObject($p, $id = null, $options = [])
    {
        $options['source']        = $options['source']        ?? null;
        $options['profile']       = $options['profile']       ?? null;
        $options['username']      = $options['username']      ?? null;
        $options['public']        = $options['public']        ?? null;
        $options['dispatchEvent'] = $options['dispatchEvent'] ?? true;
        $options['log']           = $options['log']           ?? true;
        $options['flush']         = $options['flush']         ?? true;

        if (!is_null($id)) {
            $p['_uuid'] = $id;
        }

        /** @var EntityMetadata $metadata */
        $metadata = $this->prepareData(
            $p,
            $options['source'],
            $options['profile'],
            $options['username'],
            $options['public']
        );

        $this->save($metadata, $options['dispatchEvent'], $options['log'], $options['flush']);

        return $metadata;
    }

    /**
     * @param $xml
     * @return string|null
     */
    public function getHierarchyLevelFromXml($xml)
    {
        $dom = new DOMDocument();
        $dom->loadXml($xml);

        $xpath = new DOMXPath($dom);
        $xpath->registerNamespace('gmd', 'http://www.isotc211.org/2005/gmd');
        $xpath->registerNamespace('gco', 'http://www.isotc211.org/2005/gco');
        $xpath->registerNamespace('srv', 'http://www.isotc211.org/2005/srv');
        $xpath->registerNamespace('gml', 'http://www.opengis.net/gml');
        $xpath->registerNamespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance');


        $result = $xpath->query("/*/gmd:hierarchyLevel/gmd:MD_ScopeCode/text()");
        if ($result->length === 1) {
            return $result->item(0)->nodeValue;
        }

        $result = $xpath->query("/*/gmd:hierarchyLevel/gmd:MD_ScopeCode/@codeListValue");
        if ($result->length === 1) {
            return $result->item(0)->value;
        }

        return null;
    }

    /**
     * @param $type
     * @param EntityMetadata $metadata
     * @param $operation
     * @param $message
     * @param array $messageParams
     * @param null $path
     * @param array $params
     * @param bool $flash
     * @return mixed|void
     */
    public function log(
        $type,
        $metadata,
        $operation,
        $message,
        $messageParams = [],
        $path = null,
        $params = [],
        $flash = false
    ) {
        /** @var Log $log */
        $log = $this->logger->newLog();
        $log
            ->setType($type)
            ->setCategory('metadata')
            ->setSubcategory('')
            ->setOperation($operation)
            ->setSource(!is_null($metadata) ? $metadata->getSource() : '')
            ->setIdentifier(!is_null($metadata) ? $metadata->getId() : '')
            ->setMessage($message, $messageParams)
            ->setUsername($this->user->getUsernameFromSession())
        ;

        if ($flash) {
            $log->setFlashMessage();
        }

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
    public function success($metadata, $operation, $message, $messageParams = [], $path = null, $params = [])
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
     * @param bool $flash
     * @return mixed
     */
    public function error(
        $metadata,
        $operation,
        $message,
        $messageParams = [],
        $path = null,
        $params = [],
        $flash = false
    ) {
        $this->log('error', $metadata, $operation, $message, $messageParams, $path, $params, $flash);
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

        $this->success($entity, 'lock', '%title% gesperrt.', [
            '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
        ], 'metadata_edit', ['profile' => $entity->getProfile(), 'id' => $entity->getId()]);
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

        $this->success($entity, 'unlock', '%title% freigegeben.', [
            '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
        ], 'metadata_edit', ['profile' => $entity->getProfile(), 'id' => $entity->getId()]);
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
        $event = new MetadataChangeEvent($metadata, []);
        $this->eventDispatcher->dispatch('metadata.pre_delete', $event);

        foreach ($metadata->getGroups() as $group) {
            $metadata->removeGroups($group);
        }

        foreach ($metadata->getAddress() as $address) {
            $metadata->removeAddress($address);
        }

        $this->success($metadata, 'delete', '%title% gelöscht.', [
            '%title%' => $metadata->getTitle() !== '' ? $metadata->getTitle() : 'Datensatz'
        ]);

        // DELETE
        $this->em->persist($metadata);
        $this->em->flush();
        $this->em->remove($metadata);
        $this->em->flush();
    }

    /**
     * @param EntityMetadata $entity
     * @param bool $dispatchEvent
     * @param bool $log
     * @param bool $flush
     * @return bool
     * @throws Exception
     */
    public function save($entity, $dispatchEvent = true, $log = true, $flush = true)
    {
        $operation = 'create';

        if ($entity->getInsertTime() != $entity->getUpdateTime()) {
            $operation = 'update';
        }

        // SAVE TO DATABASE
        $event = new MetadataChangeEvent($entity, [
            'log'   => $log,
            'flush' => $flush
        ]);

        try {
            // EVENT PRE SAVE
            if ($dispatchEvent) {
                $this->eventDispatcher->dispatch('metadata.pre_save', $event);
            }

            $this->em->persist($entity);

            if ($flush) {
                $this->em->flush();
            }

            // EVENT POST SAVE
            if ($dispatchEvent) {
                $this->eventDispatcher->dispatch('metadata.post_save', $event);
            }

            $errors = $event->getErrors();

            if ($errors && $log) {
                foreach ($errors as $error) {
                    $this->error(
                        $entity,
                        $operation,
                        $error['message'],
                        $error['params'],
                        'metadata_edit',
                        ['profile' => $entity->getProfile(), 'id' => $entity->getId()]
                    );
                }
            }

            if (!$errors && $log) {
                $this->success($entity, $operation, '%title% gespeichert.', [
                    '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
                ], 'metadata_edit', ['profile' => $entity->getProfile(), 'id' => $entity->getId()]);
            }

            return true;
        } catch (Exception $e) {
            if ($log) {
                $this->error($entity, $operation, '%title% konnte nicht gespeichert werden.', [
                    '%title%' => $entity->getTitle() !== '' ? $entity->getTitle() : 'Datensatz'
                ], 'metadata_edit', ['profile' => $entity->getProfile(), 'id' => $entity->getId()]);
            }

            throw $e;
        }
    }

    /**
     * @return ObjectRepository|MetadataRepository
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

        $searchfield = trim($searchfield);

        return !empty($searchfield) ? $searchfield : 'noname';
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
     * @throws Exception
     */
    private function getTimestamp()
    {
        $dateTime = new DateTime();

        return $dateTime->getTimestamp();
    }

    /**
     * @param $metadataObject
     * @return mixed
     * @throws Exception
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
}
