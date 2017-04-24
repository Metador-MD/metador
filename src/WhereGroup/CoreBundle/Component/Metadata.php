<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Rhumsaa\Uuid\Uuid;
use WhereGroup\CoreBundle\Entity\MetadataRepository;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;
use WhereGroup\CoreBundle\Entity\Metadata as EntityMetadata;
use WhereGroup\UserBundle\Component\UserInterface;
use WhereGroup\UserBundle\Entity\User;

/**
 * Class Metadata
 * @package WhereGroup\CoreBundle\Component
 * @author A. R. Pour
 */
class Metadata implements MetadataInterface
{
    /** @var ContainerInterface  */
    protected $container;

    /** @var UserInterface  */
    protected $metadorUser;

    private $repository = "MetadorCoreBundle:Metadata";

    /**
     * @param ContainerInterface $container
     * @param UserInterface $metadorUser
     */
    public function __construct(
        ContainerInterface $container,
        UserInterface $metadorUser
    ) {
        $this->container   = $container;
        $this->metadorUser = $metadorUser;

        // Todo: needed?
        $this->systemRoles = array(
            'ROLE_SYSTEM_SUPERUSER',
            'ROLE_SYSTEM_USER'
        );
    }

    public function __destruct()
    {
        unset(
            $this->container,
            $this->metadorUser
        );
    }

    /**
     * @param $metadataId
     * @return EntityMetadata
     * @throws \Exception
     */
    public function getById($metadataId)
    {
        /** @var \WhereGroup\CoreBundle\Entity\Metadata $metadata */
        $metadata = $this->container->get('doctrine')
            ->getManager()
            ->getRepository($this->repository)
            ->findOneById($metadataId);

        if (is_null($metadata)) {
            throw new \Exception('Datensatz existiert nicht.');
        }

        // EVENT ON LOAD
        $event = new MetadataChangeEvent($metadata, array());
        $this->container->get('event_dispatcher')->dispatch('metador.on_load', $event);

        return $metadata;
    }


    /**
     * @param string $uuid
     * @return EntityMetadata
     * @throws \Exception
     */
    public function getByUUID($uuid)
    {
        /** @var \WhereGroup\CoreBundle\Entity\Metadata $metadata */
        $metadata = $this->container->get('doctrine')
            ->getManager()
            ->getRepository($this->repository)
            ->findOneByUuid($uuid);

        if (is_null($metadata)) {
            throw new \Exception('Datensatz existiert nicht.');
        }

        // EVENT ON LOAD
        $event = new MetadataChangeEvent($metadata, array());
        $this->container->get('event_dispatcher')->dispatch('metador.on_load', $event);

        return $metadata;
    }

    /**
     * @param $filter
     * @param bool $force
     * @param null $username
     * @return array
     */
    public function find($filter, $force = false, $username = null)
    {
        $filter->force = $force;

        /** @var \WhereGroup\CoreBundle\Entity\MetadataRepository $repo */
        $repo = $this->container->get('doctrine')
            ->getManager()
            ->getRepository($this->repository);

        /** @var User $user */
        $user = $this->getUser($username);

        if (is_object($user)) {
            $filter->userId = $user->getId();

            foreach ($user->getGroups() as $group) {
                $groupName = $group->getRole();

                if ($groupName === 'ROLE_SYSTEM_GEO_OFFICE') {
                    $filter->geoOffice = true;
                }

                if (substr($groupName, 0, 12) === 'ROLE_SYSTEM_') {
                    continue;
                }

                $filter->groups[] = $group->getId();
            }
        }

        $paging = array();

        if (!empty($filter->page) && !empty($filter->hits)) {
            $pagingClass = new Paging($repo->count($filter), $filter->hits, $filter->page);
            $paging = $pagingClass->calculate();
        }

        /** @var MetadataRepository $repo */
        $result = $repo->findByParams($filter);

        return array(
            'result' => $result,
            'paging' => $paging
        );
    }

    /**
     * @param $p
     * @param bool $id
     * @param null $username
     * @param bool $public
     * @return EntityMetadata
     */
    public function saveObject($p, $id = false, $username = null, $public = false)
    {
        if (empty($p['fileIdentifier']) && strlen($p['fileIdentifier']) !== 36) {
            $uuid4 = Uuid::uuid4();
            $p['fileIdentifier'] = $uuid4->toString();
        }

        $dateStamp = new \DateTime();
        $p['dateStamp'] = $dateStamp->format('Y-m-d');

        $this->checkMandatoryFields($p);

        /** @var User $user */
        $user     = $this->getUser($username);
        $metadata = $this->getObject($id, $p['fileIdentifier']);

        if ($id && $user->getId() == $metadata->getInsertUser()->getId()) {
            if (empty($p['_group_id'])) {
                $p['_group_id'] = array();
            }

            $groups = array();

            // remove groups
            foreach ($metadata->getGroups() as $group) {
                $groups[] = $group->getId();

                if (!in_array($group->getId(), $p['_group_id'])) {
                    $metadata->removeGroups($group);
                }
            }

            // add groups
            foreach ($user->getGroups() as $group) {
                if (in_array($group->getId(), $p['_group_id']) && !in_array($group->getId(), $groups)) {
                    $metadata->addGroups($group);
                }
            }
        }

        if (!$id) {
            $metadata->setInsertUser($user);
            $metadata->setInsertTime($this->getTimestamp());
            $metadata->setPublic($public);
        }

        $metadata->setLocked(isset($p['_remove_lock']) ? false : true);
        $metadata->setUpdateUser($user);
        $metadata->setUpdateTime($this->getTimestamp());
        $metadata->setUuid(isset($p['fileIdentifier']) ? $p['fileIdentifier'] : '');
        $metadata->setCodespace(isset($p['identifier'][0]['codespace']) ? $p['identifier'][0]['codespace'] : '');
        $metadata->setTitle(isset($p['title']) ? $p['title'] : '');
        $metadata->setAbstract(isset($p['abstract']) ? $p['abstract'] : '');
        $metadata->setBrowserGraphic(isset($p['browserGraphic']) ? $p['browserGraphic'] : '');
        $metadata->setObject($p);
        $metadata->setHierarchyLevel(isset($p['hierarchyLevel']) ? $p['hierarchyLevel'] : '');
        $metadata->setProfile($p['_profile']);
        $metadata->setPublic(isset($p['_public']) && $p['_public'] === '1' ? true : false);
        $metadata->setSearchfield($this->prepareSearchField($p));
        $metadata->setSource($p['_source']);
        $metadata->setReadonly(false);
        $metadata->setDate(new \DateTime($this->findDate($p)));

        if (!empty($p['bbox'][0]['nLatitude'])) {
            $metadata->setBboxn($p['bbox'][0]['nLatitude']);
            $metadata->setBboxe($p['bbox'][0]['eLongitude']);
            $metadata->setBboxs($p['bbox'][0]['sLatitude']);
            $metadata->setBboxw($p['bbox'][0]['wLongitude']);
        }

        $this->save($metadata);

        $this->container
            ->get('metador_logger')
            ->success(
                'system',
                'plugin',
                'upload',
                'source',
                'identifier',
                (isset($p['title']) ? $p['title'] : 'Datensatz') . ' gespeichert.'
            );
        return $metadata;
    }

    /**
     * @param $id
     * @return bool
     */
    public function deleteById($id)
    {
        $em = $this->container->get('doctrine')->getManager();
        $metadata = $this->getById($id);

        try {
            if ($metadata) {
                // EVENT PRE DELETE
                $event = new MetadataChangeEvent($metadata, array());
                $this->container->get('event_dispatcher')->dispatch('metador.pre_delete', $event);

                foreach ($metadata->getGroups() as $group) {
                    $metadata->removeGroups($group);
                }

                // DELETE
                $em->persist($metadata);
                $em->flush();
                $em->remove($metadata);
                $em->flush();
            }
        } catch (\Exception $e) {
            $this->container->get('metador_logger')->flashError('system', 'plugin', 'upload', 'source', 'identifier', $e->getMessage());
            return false;
        }

        return true;
    }

    /**
     * @param $entity
     * @return bool
     */
    public function save($entity)
    {
        $event  = new MetadataChangeEvent($entity, array());

        // EVENT PRE SAVE
        $this->container->get('event_dispatcher')->dispatch('metador.pre_save', $event);

        // SAVE TO DATABASE
        $entityManager = $this->container->get('doctrine')->getManager();
        $entityManager->persist($entity);
        $entityManager->flush();

        // EVENT POST SAVE
        $this->container->get('event_dispatcher')->dispatch('metador.post_save', $event);
    }

    /**
     * @param $username
     * @return mixed
     */
    private function getUser($username)
    {
        return is_null($username)
            ? $this->metadorUser->getUserFromSession()
            : $this->metadorUser->getByUsername($username);
    }

    /**
     * @param $id
     * @param $uuid
     * @return EntityMetadata
     * @throws \Exception
     */
    private function getObject($id, $uuid)
    {
        // Metadata exists
        if ($id !== false) {
            return $this->getById($id);
        }

        $entity = $this
            ->container
            ->get('doctrine')
            ->getManager()
            ->getRepository($this->repository)
            ->findByUuid($uuid);

        if ($entity) {
            throw new \Exception("UUID existiert bereits!");
        }

        // New Metadata
        return new EntityMetadata();
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
     * @param $p
     * @throws \Exception
     */
    private function checkMandatoryFields($p)
    {
        // Check for uuid
        if (!isset($p['fileIdentifier']) || empty($p['fileIdentifier'])) {
            throw new \Exception("fileIdentifier nicht gefunden");
        }

        if (!isset($p['_profile']) || empty($p['_profile'])) {
            throw new \Exception("_profile nicht gefunden");
        }
    }

    /**
     * @param $p
     * @return string
     */
    private function prepareSearchField($p)
    {
        $searchfield  = '';
        $searchfield .= isset($p['_searchfield']) ? ' ' . strtolower($p['_searchfield']) : '';
        $searchfield .= isset($p['title'])        ? ' ' . strtolower($p['title']) : '';
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

        if (empty($metadataObject['dateStamp'])) {
            throw new \Exception("dateStamp empty!");
        }

        return $metadataObject['dateStamp'];
    }

    /**
     * @param $name
     * @return mixed
     */
    public function getQueryBuilder($name)
    {
        return $this->container->get('doctrine')
            ->getManager()
            ->getRepository($this->repository)
            ->createQueryBuilder($name);
    }
}
