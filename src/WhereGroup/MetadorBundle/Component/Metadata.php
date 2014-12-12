<?php

namespace WhereGroup\MetadorBundle\Component;

use Doctrine\ORM\QueryBuilder;
use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\MetadorBundle\Event\MetadataChangeEvent;
use WhereGroup\MetadorBundle\Entity\Metadata as EntityMetadata;
use WhereGroup\MetadorBundle\Entity\Address;

/**
 * Class Metadata
 * @package WhereGroup\MetadorBundle\Component
 * @author A. R. Pour
 */
class Metadata implements MetadataInterface
{
    protected $container;
    protected $metadorUser;
    protected $address;

    const REPOSITORY = "WhereGroupMetadorBundle:Metadata";

    /**
     * @param ContainerInterface $container
     * @param MetadorUserInterface $metadorUser
     * @param AddressInterface $address
     */
    public function __construct(
        ContainerInterface $container,
        MetadorUserInterface $metadorUser,
        AddressInterface $address
    ) {
        $this->container = $container;
        $this->metadorUser = $metadorUser;
        $this->address = $address;
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getById($id)
    {
        /** @var \WhereGroup\MetadorBundle\Entity\Metadata $metadata */
        $metadata = $this->container->get('doctrine')
            ->getManager()
            ->getRepository(self::REPOSITORY)
            ->findOneById($id);

        $metadata->setReadonly(!$this->metadorUser->checkMetadataAccess($metadata));

        // EVENT ON LOAD
        $event = new MetadataChangeEvent($metadata, $this->container->getParameter('metador'));
        $this->container->get('event_dispatcher')->dispatch('metador.on_load', $event);

        return $metadata;
    }

    public function getByUUID($uuid)
    {
        /** @var \WhereGroup\MetadorBundle\Entity\Metadata $metadata */
        $metadata = $this->container->get('doctrine')
            ->getManager()
            ->getRepository(self::REPOSITORY)
            ->findOneByUuid($uuid);

        if ($metadata) {
            $metadata->setReadonly(!$this->metadorUser->checkMetadataAccess($metadata));

            // EVENT ON LOAD
            $event = new MetadataChangeEvent($metadata, $this->container->getParameter('metador'));
            $this->container->get('event_dispatcher')->dispatch('metador.on_load', $event);
        }

        return $metadata;
    }

    /**
     * @param $limit
     * @param $offset
     * @param null $type
     * @return mixed
     */
    public function getMetadata($limit, $offset, $type = null)
    {
        /** @var QueryBuilder $qb */
        $qb = $this->container->get('doctrine')->getManager()->createQueryBuilder();

        /** @var QueryBuilder $queryBuilder */
        $queryBuilder = $this->container
            ->get('doctrine')
            ->getRepository(self::REPOSITORY)
            ->createQueryBuilder('m')
            ->orderBy('m.updateTime', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if (strtolower($type) === 'dataset') {
            $queryBuilder
                ->where($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', '?1'),
                    $qb->expr()->eq('m.hierarchyLevel', '?2')
                ))
                ->setParameters(array(
                    1 => 'dataset',
                    2 => 'series',
                ));
        } elseif (strtolower($type) === 'service') {
            $queryBuilder
                ->where($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', '?1')
                ))
                ->setParameters(array(1 => 'service'));
        }

        /** @var \WhereGroup\MetadorBundle\Entity\Metadata[] $result */
        $result = $queryBuilder
            ->getQuery()
            ->getResult();

        for ($i=0,$iL=count($result); $i<$iL; $i++) {
            $result[$i]->setReadonly(!$this->metadorUser->checkMetadataAccess($result[$i]));
        }

        return $result;
    }

    public function getMetadataCount($type)
    {
        /** @var QueryBuilder $qb */
        $qb = $this->container->get('doctrine')->getManager()->createQueryBuilder();

        /** @var QueryBuilder $queryBuilderC */
        $queryBuilderC = $this->container
            ->get('doctrine')
            ->getRepository(self::REPOSITORY)
            ->createQueryBuilder('m')
            ->select('count(m)');

        if (strtolower($type) === 'dataset') {
            $queryBuilderC
                ->where($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', '?1'),
                    $qb->expr()->eq('m.hierarchyLevel', '?2')
                ))
                ->setParameters(array(
                    1 => 'dataset',
                    2 => 'series',
                ));
        } elseif (strtolower($type) === 'service') {
            $queryBuilderC
                ->where($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', '?1')
                ))
                ->setParameters(array(1 => 'service'));
        }

        return $queryBuilderC->getQuery()->getSingleScalarResult();
    }

    /**
     * @param $limit
     * @param $offset
     * @return mixed
     */
    public function getDataset($limit, $offset)
    {
        return $this->getMetadata($limit, $offset, 'dataset');
    }

    /**
     * @param $limit
     * @param $offset
     * @return mixed
     */
    public function getService($limit, $offset)
    {
        return $this->getMetadata($limit, $offset, 'service');
    }

    public function getServiceCount()
    {
        return $this->getMetadataCount('service');
    }

    public function getDatasetCount()
    {
        return $this->getMetadataCount('dataset');
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
            $this->container->get('session')->getFlashBag()->add(
                'error',
                "'Identifikation > Bezeichner > Code' darf nicht leer sein!"
            );

            return false;
        }

        if (empty($p['revisionDate'])) {
            if (empty($p['publicationDate'])) {
                if (empty($p['creationDate'])) {
                    $date = $p['dateStamp'];
                } else {
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
                        $searchfield .= '<br/>' . strtolower($keyword);
                    }
                }
            }
        }

        $metadata->setUpdateUser($user);
        $metadata->setUpdateTime($now->getTimestamp());
        $metadata->setUuid($p['fileIdentifier']);
        $metadata->setCodespace(isset($p['identifier'][0]['codespace']) ? $p['identifier'][0]['codespace'] : '');
        $metadata->setTitle(isset($p['title']) ? $p['title'] : '');
        $metadata->setAbstract(isset($p['abstract']) ? $p['abstract'] : '');
        $metadata->setBrowserGraphic(isset($p['browserGraphic']) ? $p['browserGraphic'] : '');
        $metadata->setObject($p);
        $metadata->setHierarchyLevel($p['hierarchyLevel']);
        $metadata->setSearchfield(trim($searchfield));
        $metadata->setReadonly(false);
        $metadata->setDate(new \DateTime($date));

        if (!empty($p['bbox'][0]['nLatitude'])) {
            $metadata->setBboxn($p['bbox'][0]['nLatitude']);
            $metadata->setBboxe($p['bbox'][0]['eLongitude']);
            $metadata->setBboxs($p['bbox'][0]['sLatitude']);
            $metadata->setBboxw($p['bbox'][0]['wLongitude']);
        }

        $event  = new MetadataChangeEvent($metadata, $this->container->getParameter('metador'));

        // EVENT PRE SAVE
        try {
            $this->container->get('event_dispatcher')->dispatch('metador.pre_save', $event);
        } catch (\Exception $e) {
            $this->container->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }

        // SAVE TO DATABASE
        $em->persist($metadata);
        $em->flush();

        // EVENT POST SAVE
        try {
            $this->container->get('event_dispatcher')->dispatch('metador.post_save', $event);
        } catch (\Exception $e) {
            $this->container->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }

        $this->address->set($metadata->getObject());

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
                $event = new MetadataChangeEvent($metadata, $this->container->getParameter('metador'));
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
}
