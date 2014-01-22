<?php
namespace WhereGroup\MetadorBundle\Component;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use WhereGroup\MetadorBundle\Entity\Address;
use WhereGroup\MetadorBundle\Entity\Metadata;
use WhereGroup\MetadorBundle\Event\MetadataChangeEvent;
use WhereGroup\MetadorBundle\Component\MetadorDocument;

/**
 * Klasse zum bearbeiten von Metadaten.
 */
class MetadorController extends Controller
{
    private $path = null;

    public function __construct() {
        $this->path = __DIR__ . "/../Data/";
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

    public function getMetadata($id) {
        return $this->getDoctrine()
            ->getManager()
            ->getRepository('WhereGroupMetadorBundle:Metadata')
            ->findOneById($id);
    }

    public function loadMetadata($id) {
        $metadata = $this->getDoctrine()
            ->getManager()
            ->getRepository('WhereGroupMetadorBundle:Metadata')
            ->findOneById($id);

        if($metadata) {
            return unserialize($metadata->getMetadata());    
        }

        return false;
    }

    public function deleteMetadata($id) {
        $em = $this->getDoctrine()->getManager();
        $metadata = $em->getRepository('WhereGroupMetadorBundle:Metadata')->findOneById($id);

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
        $p = MetadorDocument::normalize($p);

        $user   = $this->get('security.context')->getToken()->getUser();
        $now    = new \DateTime();
        $em     = $this->getDoctrine()->getManager();
        

        // UPDATE
        if($id) {
            $metadata = $em->getRepository('WhereGroupMetadorBundle:Metadata')->findOneById($id);

            $hasAccess = false;
            foreach ($user->getRoles() as $userRole)
                foreach ($metadata->getGroups() as $group)
                    if($userRole === $group)
                        $hasAccess = true;

            if(!$hasAccess) {
                $this->get('session')->getFlashBag()->add('error', 'Sie haben nicht die nötigen Rechte.');
                return false;
            }

        // INSERT
        } else {
            $metadata = new Metadata();
            $metadata->setInsertUser($user);
            $metadata->setInsertTime($now->getTimestamp());
            $metadata->setPublic(false);
            
            // FIND UUID IN DATABASE
            $uuid = $em->getRepository('WhereGroupMetadorBundle:Metadata')->findByUuid($p['identifier'][0]['code']);
            if($uuid) {
                $this->get('session')->getFlashBag()->add('error', "UUID existiert bereits!");
                return false;
            }
        }

        // CHECK FOR UUID
        if(!isset($p['identifier'][0]['code']) || empty($p['identifier'][0]['code'])) {
            $this->get('session')->getFlashBag()->add('error', "'Identifikation > Bezeichner > Code' darf nicht leer sein!");
            return false;
        }

        $metadata->setUpdateUser($user);
        $metadata->setUpdateTime($now->getTimestamp());
        $metadata->setUuid(@$p['identifier'][0]['code']);
        $metadata->setCodespace(@$p['identifier'][0]['codespace']);
        $metadata->setTitle(@$p['title']);
        $metadata->setAbstract(@$p['abstract']);
        $metadata->setBrowserGraphic(isset($p['browserGraphic']) ? $p['browserGraphic'] : '');
        $metadata->setMetadata(serialize($p));
        $metadata->setHierarchyLevel($p['hierarchyLevel']);
        $metadata->setSearchfield(trim(
            @$p['title'] . ' ' . @$p['abstract']
        ));
        $metadata->setGroups($user->getRoles());

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

        // SAVE NEW ADDRESSES
        $addresses = array_merge(
            $p['responsiblePartyMetadata'], 
            $p['responsibleParty'],
            $p['responsiblePartyDistributor']
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