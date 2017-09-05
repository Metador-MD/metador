<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Component\PDFExport;

/**
 * @Route("/public/export")
 */
class ExportController extends Controller
{
    /**
     * @Route("/xml/{id}", name="metador_export_xml")
     * @Method("GET")
     */
    public function xmlAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $p = $metadata->getObject();

        $this->denyAccessUnlessGranted('view', $p);

        return $this->xmlResponse(
            $this->get('metador_metadata')->objectToXml($p)
        );
    }

    /**
     * @Route("/json/{id}", name="metador_export_json")
     * @Method("GET")
     */
    public function jsonAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $p = $metadata->getObject();

        $this->denyAccessUnlessGranted('view', $p);

        ksort($p);
        return new JsonResponse($p);
    }

    /**
     * @Route("/obj/{id}", name="metador_export_obj")
     * @Method("GET")
     */
    public function objAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $p = $metadata->getObject();

        $this->denyAccessUnlessGranted('view', $p);

        ksort($p);
        return new Response('<pre>' . print_r($p, 1) . '</pre>');
    }

    /**
     * @Route("/pdf/{id}", name="metador_export_pdf")
     * @Method("GET")
     */
    public function pdfAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $p = $metadata->getObject();

        $this->denyAccessUnlessGranted('view', $p);

        $className = $this
            ->get('metador_plugin')
            ->getPluginClassName($p['_profile']);

        $html = $this->render($className . ":Export:pdf.html.twig", array(
            "p" => $p
        ));

        /**
         * Extract as Component PDFExporter
         *
         */
        error_reporting(E_ERROR);
        $pdf = new PDFExport('P', 'mm', 'A4', true, 'UTF-8', false, false);
        $pdf->setUUID($p['_uuid']);
        $pdf->createPdf($html->getContent(), $p);
    }

    /**
    * @Route("/html/{id}", name="metador_export_html")
    * @Method("GET")
    */
    public function htmlAction($id)
    {
        $metadata = $this->get('metador_metadata')->getById($id);
        $p = $metadata->getObject();

        $this->get('metador_core')
            ->denyAccessUnlessGranted('view', $p);

        $className = $this
            ->get('metador_plugin')
            ->getPluginClassName($p['_profile']);

        return $this->render($className . ":Export:html.html.twig", array(
            "p" => $p
        ));
    }

    /**
     * @param $xml
     * @return Response
     */
    private function xmlResponse($xml)
    {
        $response = new Response();
        $response->headers->set('Content-Type', 'text/xml');
        $response->setContent("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" . $xml);
        return $response;
    }
}
