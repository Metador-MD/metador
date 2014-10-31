<?php

namespace WhereGroup\MetadorBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\MetadorBundle\Event\MetadataChangeEvent;
use WhereGroup\MetadorBundle\Entity\Metadata as EntityMetadata;
use WhereGroup\MetadorBundle\Entity\Address;

class Metadata
{
    protected $container;
    protected $metadorUser;
    protected $address;

    public function __construct(
        ContainerInterface $container,
        MetadorUserInterface $metadorUser,
        AddressInterface $address
    ) {
        $this->container = $container;
        $this->metadorUser = $metadorUser;
        $this->address = $address;
    }

    public function getById($id)
    {
        $metadata = $this->container->get('doctrine')
            ->getManager()
            ->getRepository('WhereGroupMetadorBundle:Metadata')
            ->findOneById($id);

        $metadata->setReadonly(!$this->metadorUser->checkMetadataAccess($metadata));

        // EVENT ON LOAD
        $event = new MetadataChangeEvent($metadata, $this->container->getParameter('metador'));
        $this->container->get('event_dispatcher')->dispatch('metador.on_load', $event);

        return $metadata;
    }

    public function getMetadata($limit, $offset, $type = null)
    {
        $qb = $this->container->get('doctrine')->getManager()->createQueryBuilder();

        $queryBuilder = $this->container
            ->get('doctrine')
            ->getRepository('WhereGroupMetadorBundle:Metadata')
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
        } elseif (strtolower($type) === 'service'){
            $queryBuilder
                ->where($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', '?1')
                ))
                ->setParameters(array(1 => 'service'));
        }

        $result = $queryBuilder
            ->getQuery()
            ->getResult();

        for($i=0,$iL=count($result); $i<$iL; $i++) {
            $result[$i]->setReadonly(!$this->metadorUser->checkMetadataAccess($result[$i]));
        }

        return $result;
    }

    public function getDataset($limit, $offset)
    {
        return $this->getMetadata($limit, $offset, 'dataset');
    }

    public function getService($limit, $offset)
    {
        return $this->getMetadata($limit, $offset, 'service');
    }

    public function saveObject($p, $id = false, $username = null)
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
            $metadata = new EntityMetadata();
            $metadata->setInsertUser($user);
            $metadata->setInsertTime($now->getTimestamp());
            $metadata->setPublic(false);
            $metadata->setGroups($user->getRoles());

            // FIND UUID IN DATABASE
            $uuid = $em->getRepository('WhereGroupMetadorBundle:Metadata')->findByUuid($p['fileIdentifier']);

            if ($uuid) {
                $this->container->get('session')->getFlashBag()->add('error', "UUID existiert bereits!");
                return false;
            }
        }

        // CHECK FOR UUID
        if (!isset($p['fileIdentifier']) || empty($p['fileIdentifier'])) {
            $this->container->get('session')->getFlashBag()->add('error', "'Identifikation > Bezeichner > Code' darf nicht leer sein!");
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
                if (isset($value['value'])) {
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
        } catch(Exception $e) {
            $this->container->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }

        // SAVE TO DATABASE
        $em->persist($metadata);
        $em->flush();

        // EVENT POST SAVE
        try {
            $this->container->get('event_dispatcher')->dispatch('metador.post_save', $event);
        } catch(Exception $e) {
            $this->container->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }

        $this->address->set($metadata->getObject());

        // SET FLASH
        $this->container->get('session')->getFlashBag()->add('success', 'Datensatz erfolgreich eingetragen.');
        return true;
    }

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
        } catch(Exception $e) {
            $this->container->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }

        return true;
    }
}
