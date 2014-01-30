<?php

namespace WhereGroup\MetadorBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

use WhereGroup\MetadorBundle\Entity\Metadata;
use WhereGroup\MetadorBundle\Entity\Helptext;
use WhereGroup\MetadorBundle\Entity\Address;
use WhereGroup\MetadorBundle\Event\MetadataChangeEvent;
use WhereGroup\MetadorBundle\Component\MetadorController;
use WhereGroup\MetadorBundle\Component\MetadorDocument;


/**
 * @Route("/metador")
 */
class DefaultController extends MetadorController
{
    /**
     * @Route("/")
     * @Template("WhereGroupMetadorBundle::index.html.twig")
     */
    public function indexAction() {
        $limit = 30;
        $offset = 0;

        return array(
            'service' => $this->getService($limit, $offset),
            'dataset' => $this->getDataset($limit, $offset),
            'address' => $this->getAddress()
        );
    }

    /**
     * @Route("/xml/{id}")
     */
    public function xmlAction($id) {
        $em = $this->getDoctrine()->getManager();

        $metadata = $em->getRepository('WhereGroupMetadorBundle:Metadata')->findOneById($id);
        
        if($metadata) {
            $p = $metadata->getObject();

            $data = array('p' => $p);

            $conf = $this->container->getParameter('metador');

            switch($p['hierarchyLevel']) {
                case 'service' : 
                    $template = $conf['templates']['form'] . ':Service:service.xml.twig';
                    break;
                case 'dataset' :
                case 'series' :
                    $template = $conf['templates']['form'] . ':Dataset:dataset.xml.twig';
                    break;
                default :
                    $template = "WhereGroupMetadorBundle::exception.xml.twig";
                    $data = array('message' => 'HierarchyLevel unbekannt!');
            }

            $xml = $this->render($template, $data);

        } else {
            $xml = $this->render("WhereGroupMetadorBundle::exception.xml.twig", array(
                "message" => "Datensatz nicht gefunden."
            ));
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'text/xml');
        $response->setContent($xml->getContent());
        
        return $response;
    }

    /**
     * @Route("/obj/{id}")
     */
    public function objAction($id) {
        $em = $this->getDoctrine()->getManager();

        $metadata = $em->getRepository('WhereGroupMetadorBundle:Metadata')->findOneById($id);
        
        if($metadata) {
            
            $p = $metadata->getObject();
            ksort($p);

            die('<pre>' . print_r($p, 1) . '</pre>');

        } else {
            $xml = $this->render("WhereGroupMetadorBundle::exception.xml.twig", array(
                "message" => "Datensatz nicht gefunden."
            ));
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'text/xml');
        $response->setContent($xml->getContent());
        
        return $response;
    }

    /**
     * @Route("/xmlimport/{id}")
     */
    public function xmlimportAction($id) {
        $em = $this->getDoctrine()->getManager();

        $metadata = $em->getRepository('WhereGroupMetadorBundle:Metadata')->findOneById($id);
        
        if($metadata) {
            $p = unserialize($metadata->getMetadata());

            $data = array('p' => $p);

            $conf = $this->container->getParameter('metador');

            switch($p['hierarchyLevel']) {
                case 'service' : 
                    $template = $conf['templates']['form'] . ':Service:service.xml.twig';
                    break;
                case 'dataset' :
                case 'series' :
                    $template = $conf['templates']['form'] . ':Dataset:dataset.xml.twig';
                    break;
                default :
                    $template = "WhereGroupMetadorBundle::exception.xml.twig";
                    $data = array('message' => 'HierarchyLevel unbekannt!');
            }

            $xml = $this->render($template, $data);
            $import = $this->get('metadata_import');

            $array = $import->load(
                $xml->getContent(), 
                $this->container->getParameter('metador')
            );

            die('<pre>' . print_r($array, 1) . '</pre>');


            die;
        } else {
            $xml = $this->render("WhereGroupMetadorBundle::exception.xml.twig", array(
                "message" => "Datensatz nicht gefunden."
            ));
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'text/xml');
        $response->setContent($xml->getContent());
        
        return $response;
    }

    /**
     * @Route("/help/get")
     * @Method({"POST", "GET"})
     */
    public function getHelptext() {
        $helptext = new Helptext();
        $string = "";

        $id = $this->getRequest()->get('id', false);

        $em = $this->getDoctrine()->getManager();
        $helptext = $em->getRepository('WhereGroupMetadorBundle:Helptext')->findOneById($id);

        if($helptext) {
            $string = $helptext->getText();
        } else {
            $string = "Hilfetext nicht definiert.";
        }

        $html = $this->render("WhereGroupMetadorBundle:Design:helptext.html.twig", array(
            "html" => $string
        ));
        $response = new Response();
        $response->headers->set('Content-Type', 'text/html');
        $response->setContent($html->getContent());
        return $response;
    }

    /**
     * @Route("/help/set")
     * @Method("POST")
     */
    public function setHelptext() {
        if (false === $this->get('security.context')->isGranted('ROLE_METADOR_ADMIN'))
            throw new AccessDeniedException();

        $id = $this->getRequest()->get('id', false);
        $html = $this->getRequest()->get('html', false);
        $debug = "";

        if($id && $html) {
            $em = $this->getDoctrine()->getManager();
            $helptext = $em->getRepository('WhereGroupMetadorBundle:Helptext')->findOneById($id);

            $html = str_replace(array('&gt;', '&lt;'), array('>', '<'), $html);
            $html = str_replace(
                array('<div>','</div>'), 
                array('',''), 
                $html)
            ;

            if($helptext) {
                $helptext->setText($html);
            } else {
                $helptext = new Helptext();
                $helptext->setId($id);
                $helptext->setText($html);
            }

            $em->persist($helptext);
            $em->flush();
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'text/html');
        $response->setContent('done');
        return $response;
    }

    /**
     * @Route("/address/get")
     * @Method({"POST", "GET"})
     */
    public function addressGetAction() {
        if (false === $this->get('security.context')->isGranted('ROLE_USER'))
            throw new AccessDeniedException();

        $array = array();
        $em = $this->getDoctrine()->getManager();
        $addresses = $em->getRepository('WhereGroupMetadorBundle:Address')->findAll();
        
        foreach($addresses as $address) {
            $array[] = array(
                'organisationName' => $address->getOrganisationName(),
                'electronicMailAddress' => $address->getElectronicMailAddress(),
                'role' => $address->getRole(),
                'positionName' => $address->getPositionName(),
                'individualName' => $address->getIndividualName(),
                'country' => $address->getCountry(),
                'administrativeArea' => $address->getAdministrativeArea(),
                'deliveryPoint' => $address->getDeliveryPoint(),
                'city' => $address->getCity(),
                'postalCode' => $address->getPostalCode(),
                'voice' => $address->getVoice(),
                'facsimile' => $address->getFacsimile(),
                'onlineResource' => $address->getOnlineResource()
            );
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');
        $response->setContent(json_encode($array));
        return $response;
    }

    /**
     * @Route("/address/delete/{id}")
     * @Method("POST")
     */
    public function addressDeleteAction($id) {
        if (false === $this->get('security.context')->isGranted('ROLE_USER'))
            throw new AccessDeniedException();

        $em = $this->getDoctrine()->getManager();
        $address = $em->getRepository('WhereGroupMetadorBundle:Address')->findOneById($id);

        try {
            if($address) {
                $em->remove($address);
                $em->flush();
            }
        } catch(Exception $e) {
            $this->get('session')->getFlashBag()->add('error', $e->getMessage());
        }

        return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
    }

    /**
     * @Route("/share")
     * @Method("POST")
     */
    public function shareAction() {
        if (false === $this->get('security.context')->isGranted('ROLE_USER'))
            throw new AccessDeniedException();

        $public = $this->getRequest()->get('public', 0);
        $id = $this->getRequest()->get('id', null);

        $em = $this->getDoctrine()->getManager();
        $metadata = $em->getRepository('WhereGroupMetadorBundle:Metadata')->findOneById($id);

        if($metadata) {
            $metadata->setPublic($public);

            $event  = new MetadataChangeEvent($metadata, $this->container->getParameter('metador'));

            $this->get('event_dispatcher')->dispatch('metador.pre_save', $event);
            $em->persist($metadata);
            $em->flush();
            $this->get('event_dispatcher')->dispatch('metador.post_save', $event);

        }
        
        return new Response();
    }
}
