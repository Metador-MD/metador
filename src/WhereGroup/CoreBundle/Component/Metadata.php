<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\ORM\QueryBuilder;
use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;
use WhereGroup\CoreBundle\Entity\Metadata as EntityMetadata;

/**
 * Class Metadata
 * @package WhereGroup\CoreBundle\Component
 * @author A. R. Pour
 */
class Metadata implements MetadataInterface
{
    /** @var ContainerInterface  */
    protected $container;

    /** @var MetadorUserInterface  */
    protected $metadorUser;

    const REPOSITORY = "WhereGroupCoreBundle:Metadata";

    /**
     * @param ContainerInterface $container
     * @param MetadorUserInterface $metadorUser
     */
    public function __construct(
        ContainerInterface $container,
        MetadorUserInterface $metadorUser
    ) {
        $this->container = $container;
        $this->metadorUser = $metadorUser;
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getById($id)
    {
        /** @var \WhereGroup\CoreBundle\Entity\Metadata $metadata */
        $metadata = $this->container->get('doctrine')
            ->getManager()
            ->getRepository(self::REPOSITORY)
            ->findOneById($id);

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
            ->getRepository(self::REPOSITORY)
            ->findOneByUuid($uuid);

        if ($metadata) {
            $metadata->setReadonly(!$this->metadorUser->checkMetadataAccess($metadata));

            // EVENT ON LOAD
            $event = new MetadataChangeEvent($metadata, array());
            $this->container->get('event_dispatcher')->dispatch('metador.on_load', $event);
        }

        return $metadata;
    }

    public function getMetadata($limit, $page, $profile)
    {
        $paging = new Paging($this->getMetadataCount($profile), $limit, $page);

        /** @var QueryBuilder $qb */
        $qb = $this->container->get('doctrine')->getManager()->createQueryBuilder();

        /** @var QueryBuilder $queryBuilder */
        $queryBuilder = $this->container
            ->get('doctrine')
            ->getRepository(self::REPOSITORY)
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
     * @param $type
     * @return integer
     */
    public function getMetadataCount($profile)
    {
        /** @var QueryBuilder $qb */
        $qb = $this->container->get('doctrine')->getManager()->createQueryBuilder();

        /** @var QueryBuilder $queryBuilderC */
        $queryBuilderC = $this->container
            ->get('doctrine')
            ->getRepository(self::REPOSITORY)
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
        if (is_null($username)) {
            $user = $this->metadorUser->getUser();
        } else {
            $user = $this->metadorUser->getUserByUsername($username);
        }

        $now  = new \DateTime();
        $em   = $this->container->get('doctrine')->getManager();

        // UPDATE
        if ($id) {
            $update = true;
            $metadata = $this->getById($id);

            if ($metadata->getReadonly()) {
                $this->container->get('session')->getFlashBag()->add('error', 'Sie haben nicht die nötigen Rechte.');
                return false;
            }

            if ($metadata->getInsertUser()->getId() === $user->getId()) {
                $metadata->setGroups($user->getRoles());
            }

        // INSERT
        } else {
            $update = false;
            $metadata = new EntityMetadata();
            $metadata->setInsertUser($user);
            $metadata->setInsertTime($now->getTimestamp());
            $metadata->setPublic($public);
            $metadata->setGroups($user->getRoles());

            // FIND UUID IN DATABASE
            $uuid = $em->getRepository(self::REPOSITORY)->findByUuid($p['fileIdentifier']);

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

        $date = "";

        if (empty($p['revisionDate'])) {
            if (empty($p['publicationDate'])) {
                if (empty($p['creationDate']) && !empty($p['dateStamp'])) {
                    $date = $p['dateStamp'];
                } elseif (!empty($p['creationDate'])) {
                    $date = $p['creationDate'];
                }
            } else {
                $date = $p['publicationDate'];
            }
        } else {
            $date = $p['revisionDate'];
        }


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
        } else {
            $this->container->get('session')->getFlashBag()->add(
                'success',
                $title . ' eingetragen.'
            );
        }

        return true;
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
        $em = $this->container->get('doctrine')->getManager();
        $event  = new MetadataChangeEvent($entity, array());

        // EVENT PRE SAVE
        try {
            $this->container->get('event_dispatcher')->dispatch('metador.pre_save', $event);
        } catch (\Exception $e) {
            $this->container->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }

        // SAVE TO DATABASE
        $em->persist($entity);
        $em->flush();

        // EVENT POST SAVE
        try {
            $this->container->get('event_dispatcher')->dispatch('metador.post_save', $event);
        } catch (\Exception $e) {
            $this->container->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }
    }
}
