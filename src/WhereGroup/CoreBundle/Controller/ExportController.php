<?php

namespace WhereGroup\CoreBundle\Controller;

use Exception;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Component\PDFExport;
use WhereGroup\CoreBundle\Component\Search\JsonFilterReader;
use WhereGroup\CoreBundle\Component\Search\PropertyNameNotFoundException;
use WhereGroup\CoreBundle\Service\Metadata\Metadata;

/**
 * @Route("/public/export")
 */
class ExportController extends Controller
{
    /**
     * @param $id
     * @return Response
     * @throws MetadataException
     * @throws PropertyNameNotFoundException
     * @Route("/xml/{id}", name="metador_export_xml", methods={"GET"})
     */
    public function xmlAction($id)
    {
        $p = $this->findObject($id);
        $this->denyAccessUnlessGranted('view', $p);

        return $this->xmlResponse(
            $this->get(Metadata::class)->getProcessor()->objectToXml($p)
        );
    }

    /**
     * @param $id
     * @return JsonResponse
     * @throws MetadataException
     * @throws PropertyNameNotFoundException
     * @Route("/json/{id}", name="metador_export_json", methods={"GET"})
     */
    public function jsonAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');
        $p = $this->findObject($id);
        $this->denyAccessUnlessGranted('view', $p);
        ksort($p);
        return new JsonResponse($p);
    }

    /**
     * @param $id
     * @return Response
     * @throws MetadataException
     * @throws PropertyNameNotFoundException
     * @Route("/obj/{id}", name="metador_export_obj", methods={"GET"})
     */
    public function objAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');
        $p = $this->findObject($id);
        $this->denyAccessUnlessGranted('view', $p);
        ksort($p);
        return new Response('<pre>' . print_r($p, 1) . '</pre>');
    }

    /**
     * @param $id
     * @throws MetadataException
     * @throws PropertyNameNotFoundException
     * @Route("/pdf/{id}", name="metador_export_pdf", methods={"GET"})
     */
    public function pdfAction($id)
    {
        $p = $this->findObject($id);
        $this->denyAccessUnlessGranted('view', $p);
        $className = $this->get('metador_plugin')->getPluginClassName($p['_profile']);
        $html = $this->render($className . ":Export:pdf.html.twig", [
            "p" => $p
        ]);

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
     * @param $id
     * @return Response
     * @throws MetadataException
     * @throws PropertyNameNotFoundException
     * @throws Exception
     * @Route("/html/{id}", name="metador_export_html", methods={"GET"})
     */
    public function htmlAction($id)
    {
        $p = $this->findObject($id);
        $this->get('metador_core')->denyAccessUnlessGranted('view', $p);
        $className = $this->get('metador_plugin')->getPluginClassName($p['_profile']);
        return $this->render($className . ":Export:html.html.twig", [
            "p" => $p
        ]);
    }

    /**
     * @param $xml
     * @return Response
     */
    protected function xmlResponse($xml)
    {
        $response = new Response();
        $response->headers->set('Content-Type', 'text/xml');
        $response->setContent("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" . $xml);
        return $response;
    }

    /**
     * @param $id
     * @return mixed
     * @throws MetadataException
     * @throws PropertyNameNotFoundException
     */
    protected function findObject($id)
    {
        $search = $this->get('metador_metadata_search');
        $response = $search
            ->setExpression(JsonFilterReader::read(['and' => ['eq' => ['id' => $id]]], $search->createExpression()))
            ->find();

        if (!isset($response['rows'][0])) {
            throw new MetadataException("Metadata not found!");
        }

        if (is_object($response['rows'][0])) {
            $p = json_decode($response['rows'][0]->object, true);
        } elseif (is_array($response['rows'][0])) {
            $p = json_decode($response['rows'][0]['object'], true);
        }

        if (!is_array($p) || !isset($p['_uuid']) || $p['_uuid'] != $id) {
            throw new MetadataException("Metadata not found!");
        }

        return $p;
    }
}
