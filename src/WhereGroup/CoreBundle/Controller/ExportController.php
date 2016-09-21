<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * @Route("/metador")
 */
class ExportController extends Controller
{
    /**
     * @Route("/xml/{id}", name="metador_export_xml")
     * @Method("GET")
     */
    public function xmlAction($id)
    {
        $metadata = $this->get('metadata')->getById($id);

        $this->denyAccessUnlessGranted('view', $metadata);

        if (!$metadata) {
            $xml = $this->render("MetadorCoreBundle::exception.xml.twig", array(
                "message" => "Datensatz nicht gefunden"
            ));
            return $this->xmlResponse($xml->getContent());
        }

        $p = $metadata->getObject();

        $className = $this
            ->get('metador_plugin')
            ->getPluginClassName($p['_profile']);

        $xml = $this->render($className .":Export:metadata.xml.twig", array(
            "p" => $p
        ));

        return $this->xmlResponse($xml->getContent());
    }

    /**
     * @Route("/obj/{id}", name="metador_export_obj")
     * @Method("GET")
     */
    public function objAction($id)
    {
        $metadata = $this->get('metadata')->getById($id);

        $this->denyAccessUnlessGranted('view', $metadata);

        if ($metadata) {
            $p = $metadata->getObject();

            ksort($p);

            return new Response('<pre>' . print_r($p, 1) . '</pre>');
        }

        return new Response('Datensatz nicht gefunden.');
    }

    /**
     * @Route("/pdf/{id}", name="metador_export_pdf")
     * @Method("GET")
     */
    public function pdfAction($id)
    {
        $metadata = $this->get('metadata')->getById($id);

        $this->denyAccessUnlessGranted('view', $metadata);

        if ($metadata) {
            return new Response('Datensatz nicht gefunden');
        }

        $p = $metadata->getObject();

        $className = $this
            ->get('metador_plugin')
            ->getPluginClassName($p['_profile']);

        $html = $this->render($className . ":Export:pdf.html.twig", array(
            "p" => $p
        ));

        error_reporting(E_ERROR);

        require_once __DIR__ . '/../../../../vendor/tecnickcom/tcpdf/tcpdf.php';

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
    }

    /**
    * @Route("/html/{id}", name="metador_export_html")
    * @Method("GET")
    */
    public function htmlAction($id)
    {
        $metadata = $this->get('metadata')->getById($id);

        $this->denyAccessUnlessGranted('view', $metadata);

        if (!$metadata) {
            return new Response('Datensatz nicht gefunden');
        }

        $p = $metadata->getObject();

        $className = $this
            ->get('metador_plugin')
            ->getPluginClassName($p['_profile']);

        return $this->render($className . ":Export:view.html.twig", array(
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
        $response->setContent($xml);
        return $response;
    }
}
