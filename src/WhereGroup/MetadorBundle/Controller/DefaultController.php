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



/**
 * @Route("/metador")
 */
class DefaultController extends Controller
{
    /**
     * @Route("/")
     * @Template("WhereGroupMetadorBundle::index.html.twig")
     */
    public function indexAction() {
        $limit = 30;
        $offset = 0;

        $metadata = $this->get('metador_metadata');
        $address = $this->get('metador_address');

        return array(
            'service' => $metadata->getService($limit, $offset),
            'dataset' => $metadata->getDataset($limit, $offset),
            'address' => $address->get()
        );
    }

    /**
     * @Route("/xml/{id}")
     */
    public function xmlAction($id) {
        $em = $this->getDoctrine()->getManager();

        $metadata = $this->get('metador_metadata');
        $data = $metadata->getById($id);

        if($data) {
            $p = $data->getObject();

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

        $metadata = $this->get('metador_metadata');
        $data = $metadata->getById($id);

        if($data) {

            $p = $data->getObject();

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
     * @Route("/pdf/{id}")
     */
    public function pdfAction($id) {
        $em = $this->getDoctrine()->getManager();
        $conf = $this->container->getParameter('metador');
        $metadata = $this->get('metador_metadata');
        $data = $metadata->getById($id);

        if($data) {

            $p = $data->getObject();

            ksort($p);

            $html = $this->render($conf['templates']['form'] . '::pdf.html.twig', array(
                "p" => $p
            ));

            error_reporting(E_ERROR);
            $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8', false, false);
            $pdf->SetCreator(PDF_CREATOR);
            $pdf->SetAuthor('Metador');
            $pdf->SetTitle($p['title']);
            $pdf->SetSubject('Metadaten');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->SetMargins(20, 20, 15);
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            $pdf->setAutoPageBreak(true, 20);
            $pdf->AddPage();
            $pdf->writeHTML($html->getContent(), true, true, false, false, '');
            $pdf->Output(md5($p['fileIdentifier']) . '.pdf', 'D');

        } else {
            // TODO: add error handling
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

        $metadata = $this->get('metador_metadata');
        $data = $metadata->getById($id);

        if($data) {
            $p = $data->getObject();

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

            ksort($array);

            die('<pre>' . print_r($array, 1) . '</pre>');

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
     * @Route("/xml_import", name="xml_upload")
     * @Method("POST")
     */
    public function xmlUploadAction() {
        foreach($this->getRequest()->files as $file) {

            if (!is_object($file)) {
                $this->get('session')->getFlashBag()->add('error', 'Bitte XML-Datei angeben.');
                return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
            }

            $path = $file->getPath() . '/' . $file->getClientOriginalName();

            $file->move(
                $file->getPath(), $file->getClientOriginalName()
            );

            if ($file->getClientOriginalExtension() === 'xml') {
                $xml = file_get_contents($path);

                $import = $this->get('metadata_import');

                $p = $import->load(
                    $xml, $this->container->getParameter('metador')
                );

                $metadata = $this->get('metador_metadata');
                $metadata->saveObject($p);

                $this->get('session')->getFlashBag()->add('info', 'Erfolgreich importiert.');
            }
        }

        return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
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
     * @Route("/share/")
     * @Method("POST")
     */
    public function shareAction() {
        if (false === $this->get('security.context')->isGranted('ROLE_USER'))
            throw new AccessDeniedException();

        $public = $this->getRequest()->get('public', 0);
        $id = $this->getRequest()->get('id', null);

        $em = $this->getDoctrine()->getManager();

        $metadata = $this->get('metador_metadata');
        $data = $metadata->getById($id);

        if($data) {
            // SYSTEM CHANGE
            $p = $data->getObject();
            $p['_SYSTEM'] = 1;
            $data->setObject($p);


            $data->setPublic($public);
            $event  = new MetadataChangeEvent($data, $this->container->getParameter('metador'));
            $this->get('event_dispatcher')->dispatch('metador.pre_save', $event);

            // REMOVE SYSTEM CHANGE
            $p = $data->getObject();
            if (isset($p['_SYSTEM']))
                unset($p['_SYSTEM']);
            $data->setObject($p);

            $em->persist($data);
            $em->flush();
            $this->get('event_dispatcher')->dispatch('metador.post_save', $event);
        }

        return new Response();
    }
}
