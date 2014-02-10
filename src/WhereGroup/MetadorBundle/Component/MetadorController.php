<?php
namespace WhereGroup\MetadorBundle\Component;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use WhereGroup\MetadorBundle\Entity\Address;
use WhereGroup\MetadorBundle\Entity\Metadata;
use WhereGroup\MetadorBundle\Event\MetadataChangeEvent;

/**
 * Klasse zum bearbeiten von Metadaten.
 */
class MetadorController extends Controller {
    private $path = null;

    public function __construct() {
        $this->path = __DIR__ . "/../Data/";
    }

    public function userHasAccess($metadata, $user = null, $ignore = null) {
        if (is_null($user))
            $user   = $this->get('security.context')->getToken()->getUser();
        
        if (!is_object($user))
            return false;

        // OWNER HAS ACCESS
        if($metadata->getInsertUser()->getId() === $user->getId())
            return true;

        if (is_null($ignore))
            $ignore = array(
                'ROLE_USER', 
                'ROLE_SUPERUSER', 
                'ROLE_ADMIN',
                'ROLE_METADOR_ADMIN');

        $hasAccess = false;

        foreach ($user->getRoles() as $userRole)
            foreach ($metadata->getGroups() as $group)
                if($userRole === $group && !in_array($group, $ignore))
                    $hasAccess = true;

        return $hasAccess;
    }

    public function getDataset($limit, $offset) {
        $qb = $this->get('doctrine')->getManager()->createQueryBuilder();

        $result = $this->container
                ->get('doctrine')
                ->getRepository('WhereGroupMetadorBundle:Metadata')
                ->createQueryBuilder('m')
                ->where($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', '?1'),
                    $qb->expr()->eq('m.hierarchyLevel', '?2')
                ))
                ->orderBy('m.updateTime', 'DESC')
                ->setFirstResult( $offset )
                ->setMaxResults( $limit )
                ->setParameters(array(
                    1 => 'dataset',
                    2 => 'series',
                ))
                ->getQuery()
                ->getResult();

        for($i=0,$iL=count($result); $i<$iL; $i++)
            $result[$i]->setReadonly(
                $this->userHasAccess($result[$i]) ? 0 : 1
            );

        return $result;
    }

    public function getService($limit, $offset) {
        $qb = $this->get('doctrine')->getManager()->createQueryBuilder();

        $result = $this->container
                ->get('doctrine')
                ->getRepository('WhereGroupMetadorBundle:Metadata')
                ->createQueryBuilder('m')
                ->where($qb->expr()->orx(
                    $qb->expr()->eq('m.hierarchyLevel', '?1')
                ))
                ->orderBy('m.updateTime', 'DESC')
                ->setFirstResult( $offset )
                ->setMaxResults( $limit )
                ->setParameters(array(1 => 'service'))
                ->getQuery()
                ->getResult();

        for($i=0,$iL=count($result); $i<$iL; $i++)
            $result[$i]->setReadonly(
                $this->userHasAccess($result[$i]) ? 0 : 1
            );

        return $result;
    }

    public function getAddress() {
        $qb = $this->get('doctrine')->getManager()->createQueryBuilder();

        $address = $this->get('doctrine')
                ->getManager()
                ->createQueryBuilder('y')
                ->select('y.id, y.individualName')
                ->from('WhereGroupMetadorBundle:Address','y')
                ->getQuery()
                ->getResult();

        return $address;
    }

    public function getExamples($hierarchyLevel) {
        $folders = array('keywords/all/');
        $keywords = array();

        if(trim($hierarchyLevel) === 'service') {
            $folders = array_merge($folders, array('keywords/service/'));
        } else if(trim($hierarchyLevel) === 'dataset') {
            $folders = array_merge($folders, array('keywords/dataset/'));
        }

        foreach($folders as $folder) {
            foreach(scandir($this->path . $folder) as $file) {
                if(substr($file, -5) != ".json") continue;

                $json = json_decode(file_get_contents($this->path . $folder . $file));
                $keywords = array_merge($keywords, (array)$json);
            }
        }

        return array(
            'keywords' => $keywords,
            'conformity' => (array)json_decode(file_get_contents($this->path . '/conformity.json')),
            'otherconstraints' => json_decode(file_get_contents($this->path . '/otherconstraints.json')),
            'bbox' => json_decode(file_get_contents($this->path . '/bbox.json')),
        );
    }

    public function loadMetadata($id) {
        $metadata = $this->getDoctrine()
            ->getManager()
            ->getRepository('WhereGroupMetadorBundle:Metadata')
            ->findOneById($id);

        $metadata->setReadonly(
            $this->userHasAccess($metadata) ? 0 : 1
        );

        // EVENT ON LOAD
        $event = new MetadataChangeEvent($metadata, $this->container->getParameter('metador'));
        $this->get('event_dispatcher')->dispatch('metador.on_load', $event);

        return $metadata;
    }

    public function deleteMetadata($id) {
        $em = $this->getDoctrine()->getManager();
        $metadata = $this->loadMetadata($id);

        if ($metadata->getReadonly()) {
            $this->get('session')->getFlashBag()->add('error', 'Sie haben nicht die nötigen Rechte.');
            return false;
        }

        try {
            if($metadata) {
                // EVENT PRE DELETE
                $event = new MetadataChangeEvent($metadata, $this->container->getParameter('metador'));
                $this->get('event_dispatcher')->dispatch('metador.pre_delete', $event);

                 // DELETE 
                $em->remove($metadata);
                $em->flush();
            }
        } catch(Exception $e) {
            $this->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }

        return true;
    }

    public function saveMetadata($p, $id = false) {
        $user   = $this->get('security.context')->getToken()->getUser();
        $now    = new \DateTime();
        $em     = $this->getDoctrine()->getManager();
        

        // UPDATE
        if($id) {
            $metadata = $this->loadMetadata($id);

            if($metadata->getReadonly()) {
                $this->get('session')->getFlashBag()->add('error', 'Sie haben nicht die nötigen Rechte.');
                return false;
            }

            if($metadata->getInsertUser()->getId() === $user->getId())
                $metadata->setGroups($user->getRoles());

        // INSERT
        } else {
            $metadata = new Metadata();
            $metadata->setInsertUser($user);
            $metadata->setInsertTime($now->getTimestamp());
            $metadata->setPublic(false);
            $metadata->setGroups($user->getRoles());
            
            // FIND UUID IN DATABASE
            $uuid = $em->getRepository('WhereGroupMetadorBundle:Metadata')->findByUuid($p['fileIdentifier']);
            if($uuid) {
                $this->get('session')->getFlashBag()->add('error', "UUID existiert bereits!");
                return false;
            }
        }

        // CHECK FOR UUID
        if(!isset($p['fileIdentifier']) || empty($p['fileIdentifier'])) {
            $this->get('session')->getFlashBag()->add('error', "'Identifikation > Bezeichner > Code' darf nicht leer sein!");
            return false;
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
        $metadata->setSearchfield(trim(
            @$p['title'] . ' ' . @$p['abstract']
        ));
        $metadata->setReadonly(false);

        $event  = new MetadataChangeEvent($metadata, $this->container->getParameter('metador'));

        // EVENT PRE SAVE
        try {
            $this->get('event_dispatcher')->dispatch('metador.pre_save', $event);
        } catch(Exception $e) {
            $this->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }

        // SAVE TO DATABASE
        $em->persist($metadata);
        $em->flush();

        // EVENT POST SAVE
        try {
            $this->get('event_dispatcher')->dispatch('metador.post_save', $event);
        } catch(Exception $e) {
            $this->get('session')->getFlashBag()->add('error', $e->getMessage());
            return false;
        }

        // TODO: bind on event!
        // SAVE NEW ADDRESSES
        $addresses = array_merge(
            isset($p['responsiblePartyMetadata'])
                ? $p['responsiblePartyMetadata'] : array(), 
            isset($p['responsibleParty'])
                ? $p['responsibleParty'] : array(),
            isset($p['responsiblePartyDistributor']) 
                ? $p['responsiblePartyDistributor'] : array()
        );

        foreach($addresses as $row) {
            if(trim(@$row['organisationName']) == ""
                || trim(@$row['individualName']) == ""
                || trim(@$row['electronicMailAddress']) == ""
            ) continue;

            $qb = $this->getDoctrine()->getEntityManager()->createQueryBuilder();

            $result = $qb
                ->select('count(u)')
                ->from('WhereGroup\MetadorBundle\Entity\Address', 'u')
                ->where($qb->expr()->andx(
                    $qb->expr()->eq('u.organisationName', '?1'),
                    $qb->expr()->eq('u.individualName', '?2'),
                    $qb->expr()->eq('u.electronicMailAddress', '?3')
                ))->setParameters(array(
                    1 => $row['organisationName'], 
                    2 => $row['individualName'],
                    3 => $row['electronicMailAddress']
                ))->getQuery()->getSingleScalarResult();

            if($result == 0) {
                $address = new Address();
                $address->setOrganisationName(@$row['organisationName']);
                $address->setElectronicMailAddress(@$row['electronicMailAddress']);
                $address->setRole(is_null(@$row['role']) ? '' : $row['role']);
                $address->setIndividualName(@$row['individualName']);
                $address->setCountry(@$row['country']);
                $address->setAdministrativeArea(@$row['administrativeArea']);
                $address->setDeliveryPoint(@$row['deliveryPoint']);
                $address->setCity(@$row['city']);
                $address->setPostalCode(@$row['postalCode']);
                $address->setVoice(@$row['voice']);
                $address->setFacsimile(@$row['facsimile']);
                $address->setOnlineResource(@$row['onlineResource']);
                $address->setPositionName(@$row['positionName']);

                $em->persist($address);
                $em->flush();
                unset($address, $result);
            }
        }

        // SET FLASH
        $this->get('session')->getFlashBag()->add('success', 'Datensatz erfolgreich eingegtragen.');
        return true;
    }

}