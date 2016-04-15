<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\ORM\QueryBuilder;
use Symfony\Component\DependencyInjection\ContainerInterface;
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

    private $repository = "WhereGroupCoreBundle:Metadata";

    private $systemRoles = array();

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
        $this->systemRoles = array(
            'ROLE_SUPERUSER',
            'ROLE_USER'
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
     * @return array
     */
    public function getSystemRoles()
    {
        return $this->systemRoles;
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

        $metadata->setReadonly(!$this->metadorUser->checkMetadataAccess($metadata));

        // EVENT ON LOAD
        $event = new MetadataChangeEvent($metadata, array());
        $this->container->get('event_dispatcher')->dispatch('metador.on_load', $event);

        return $metadata;
    }


  /**
     * @param $uuid
     * @return mixed
     */
    public function getByUUID($uuid)
    {
        /** @var \WhereGroup\CoreBundle\Entity\Metadata $metadata */
        $metadata = $this->container->get('doctrine')
            ->getManager()
            ->getRepository($this->repository)
            ->findOneByUuid($uuid);

        if ($metadata) {
            $metadata->setReadonly(!$this->metadorUser->checkMetadataAccess($metadata));

            // EVENT ON LOAD
            $event = new MetadataChangeEvent($metadata, array());
            $this->container->get('event_dispatcher')->dispatch('metador.on_load', $event);
        }

        return $metadata;
    }

    /**
     * @param $limit
     * @param $page
     * @param $profile
     * @return array
     */
    public function getMetadata($limit, $page, $profile)
    {
        $paging = new Paging($this->getMetadataCount($profile), $limit, $page);

        /** @var QueryBuilder $qb */
        $qb = $this->container->get('doctrine')->getManager()->createQueryBuilder();

        /** @var QueryBuilder $queryBuilder */
        $queryBuilder = $this->container
            ->get('doctrine')
            ->getRepository($this->repository)
            ->createQueryBuilder('m')
            ->orderBy('m.updateTime', 'DESC')
            ->setFirstResult(($page * $limit) - $limit)
            ->setMaxResults($limit)
            ->where('m.profile = :profile')
            ->setParameter('profile', $profile);

        /** @var \WhereGroup\CoreBundle\Entity\Metadata[] $result */
        $result = $queryBuilder
            ->getQuery()
            ->getResult();

        for ($i=0,$iL=count($result); $i<$iL; $i++) {
            $result[$i]->setReadonly(!$this->metadorUser->checkMetadataAccess($result[$i]));
        }

        return array(
            'result' => $result,
            'paging' => $paging->calculate()
        );
    }

    /**
     * @param string $profile
     * @return mixed
     */
    public function getMetadataCount($profile)
    {
        /** @var QueryBuilder $qb */
        $qb = $this->container->get('doctrine')->getManager()->createQueryBuilder();

        /** @var QueryBuilder $queryBuilderC */
        $queryBuilderC = $this->container
            ->get('doctrine')
            ->getRepository($this->repository)
            ->createQueryBuilder('m')
            ->select('count(m)')
            ->where('m.profile = :profile')
            ->setParameter('profile', $profile);

        return $queryBuilderC->getQuery()->getSingleScalarResult();
    }

    /**
     * @param $p
     * @param bool $id
     * @param null $username
     * @param bool $public
     * @return bool
     */
    public function saveObject($p, $id = false, $username = null, $public = false)
    {
        /** @var User $user */
        if (is_null($username)) {
            $user = $this->metadorUser->getUserFromSession();
        } else {
            $user = $this->metadorUser->getByUsername($username);
        }

        $now  = new \DateTime();
        $em   = $this->container->get('doctrine')->getManager();

        // UPDATE
        if ($id) {
            $update = true;
            $metadata = $this->getById($id);

            if ($metadata->getReadonly()) {
                $this->container
                    ->get('session')
                    ->getFlashBag()
                    ->add('error', 'Sie haben nicht die nötigen Rechte.');
                return false;
            }

            if ($metadata->getInsertUser()->getId() === $user->getId()) {
                $metadata->setGroups(array_diff($user->getRoles(), $this->systemRoles));
            }

        // INSERT
        } else {
            $update = false;
            $metadata = new EntityMetadata();
            $metadata->setInsertUser($user);
            $metadata->setInsertTime($now->getTimestamp());
            $metadata->setPublic($public);
            $metadata->setGroups(array_diff($user->getRoles(), $this->systemRoles));

            // FIND UUID IN DATABASE
            $uuid = $em->getRepository($this->repository)->findByUuid($p['fileIdentifier']);

            if ($uuid) {
                $this->container->get('session')->getFlashBag()->add('error', "UUID existiert bereits!");
                return false;
            }
        }

        // CHECK FOR UUID
        if (!isset($p['fileIdentifier']) || empty($p['fileIdentifier'])) {
            $this->container->get('session')->getFlashBag()->add('error', "UUID fehlt!");

            return false;
        }

        $date = $this->findDate($p);

        $searchfield = @$p['_searchfield'] .
            ' ' . strtolower(@$p['title']) .
            ' ' . strtolower(@$p['abstract']);

        if (isset($p['keyword'])) {
            foreach ($p['keyword'] as $value) {
                if (isset($value['value']) && !empty($value['value'])) {
                    foreach ($value['value'] as $keyword) {
                        $searchfield .= ' ' . strtolower($keyword);
                    }
                }
            }
        }

        if (!isset($p['hierarchyLevel'])) {
            throw new \RuntimeException("Hierarchy level not found!");
        }

        $p['_profile'] = isset($p['_profile']) ? $p['_profile'] : $p['hierarchyLevel'];

        $metadata->setUpdateUser($user);
        $metadata->setUpdateTime($now->getTimestamp());
        $metadata->setUuid(isset($p['fileIdentifier']) ? $p['fileIdentifier'] : '');
        $metadata->setCodespace(isset($p['identifier'][0]['codespace']) ? $p['identifier'][0]['codespace'] : '');
        $metadata->setTitle(isset($p['title']) ? $p['title'] : '');
        $metadata->setAbstract(isset($p['abstract']) ? $p['abstract'] : '');
        $metadata->setBrowserGraphic(isset($p['browserGraphic']) ? $p['browserGraphic'] : '');
        $metadata->setObject($p);
        $metadata->setHierarchyLevel($p['hierarchyLevel']);
        $metadata->setProfile($p['_profile']);
        $metadata->setPublic(isset($p['_public']) && $p['_public'] === '1' ? true : false);
        $metadata->setSearchfield(trim($searchfield));
        $metadata->setReadonly(false);
        $metadata->setDate(new \DateTime($date));

        if (!empty($p['bbox'][0]['nLatitude'])) {
            $metadata->setBboxn($p['bbox'][0]['nLatitude']);
            $metadata->setBboxe($p['bbox'][0]['eLongitude']);
            $metadata->setBboxs($p['bbox'][0]['sLatitude']);
            $metadata->setBboxw($p['bbox'][0]['wLongitude']);
        }

        $this->save($metadata);

        // SET FLASH
        $title = isset($p['title']) ? $p['title'] : 'Datensatz';

        if ($update) {
            $this->container->get('session')->getFlashBag()->add(
                'success',
                $title . ' bearbeitet.'
            );
            return true;
        }

        $this->container->get('session')->getFlashBag()->add(
            'success',
            $title . ' eingetragen.'
        );

        return true;
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
     * @param $id
     * @return bool
     */
    public function deleteById($id)
    {
        $em = $this->container->get('doctrine')->getManager();
        $metadata = $this->getById($id);

        if ($metadata->getReadonly()) {
            $this->container->get('session')->getFlashBag()->add('error', 'Sie haben nicht die nötigen Rechte.');
            return false;
        }

        try {
            if ($metadata) {
                // EVENT PRE DELETE
                $event = new MetadataChangeEvent($metadata, array());
                $this->container->get('event_dispatcher')->dispatch('metador.pre_delete', $event);

                 // DELETE
                $em->remove($metadata);
                $em->flush();
            }
        } catch (\Exception $e) {
            $this->container->get('session')->getFlashBag()->add('error', $e->getMessage());
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
        try {
            $this->container->get('event_dispatcher')->dispatch('metador.pre_save', $event);
        } catch (\Exception $e) {
            $this->container->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }

        // SAVE TO DATABASE
        $entityManager = $this->container->get('doctrine')->getManager();
        $entityManager->persist($entity);
        $entityManager->flush();

        // EVENT POST SAVE
        try {
            $this->container->get('event_dispatcher')->dispatch('metador.post_save', $event);
        } catch (\Exception $e) {
            $this->container->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }
    }
}
