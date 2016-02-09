<?php

namespace Plugins\WhereGroup\DatasetBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * Class ProfileController
 * @package Plugins\WhereGroup\DatasetBundle\Controller
 */
class ProfileController extends Controller
{
    /**
     * @Template("WhereGroupThemeBundle:Profile:index.html.twig")
     */
    public function indexAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle::form.html.twig")
     */
    public function newAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle::form.html.twig")
     */
    public function useAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle::form.html.twig")
     */
    public function editAction($data)
    {
        return $data;
    }

    /**
     * @Template("ProfileDatasetBundle::confirm.html.twig")
     */
    public function confirmAction($data)
    {
        return $data;
    }

    /**
     * @param $data
     * @return Response
     */
    public function xmlAction($data)
    {
        $xml = $this->render("ProfileDatasetBundle:Export:metadata.xml.twig", array(
            "p" => $data['p']
        ));

        $response = new Response();
        $response->headers->set('Content-Type', 'text/xml');
        $response->setContent($xml->getContent());

        return $response;
    }

    /**
     * @param $data
     */
    public function pdfAction($data)
    {
        $html = $this->render("ProfileDatasetBundle:Export:pdf.html.twig", array(
            "p" => $data['p']
        ));

        error_reporting(E_ERROR);

        require_once __DIR__ . '/../../../../../vendor/tecnick.com/tcpdf/tcpdf.php';

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
     * @param $data
     * @return Response
     */
    public function htmlAction($data)
    {
        return $this->render("ProfileServiceBundle:Export:pdf.html.twig", array(
            "p" => $data['p']
        ));
    }
}
