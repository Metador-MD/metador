<?php

namespace WhereGroup\CoreBundle\Component;

require_once __DIR__ . '/../../../../vendor/tecnickcom/tcpdf/tcpdf.php';

class PDFExport extends \TCPDF
{
    protected $uuid;

    public function __construct($orientation, $unit, $format, $unicode, $encoding, $diskcache, $pdfa)
    {
        parent::__construct($orientation, $unit, $format, $unicode, $encoding, $diskcache, $pdfa);
    }

    // @codingStandardsIgnoreLine
    public function Header()
    {
        //$this->SetFont('helvetica', null, 12);
        //$this->Image(__DIR__.'/../../ThemeBundle/Resources/public/img/logo-s.png', 170, 5, 30, '', 'PNG', '', 'T', false, 300, '', false, false, 1, false, false, false);
        //$this->MultiCell(0, 10, $this->uuid, 0, 'L', false, 1, 20, 7, true, 10, false, true, 0, 'T', false);
    }


    public function setUUID($uuid)
    {
        $this->uuid = $uuid;
    }

    public function createPdf($html, $p)
    {
        $this->SetCreator(PDF_CREATOR);
        $this->SetAuthor('Metador');
        $this->SetTitle($p['title']);
        $this->SetSubject('Metadaten');
        $this->SetFont('helvetica', '', 10);
        $this->SetMargins(25, 12, 9);
        $this->setPrintHeader(false);
        $this->setPrintFooter(false);
        $this->setAutoPageBreak(true, 20);
        $this->AddPage();
        $this->writeHTML($html, true, true, false, false, '');
        $this->Output();
//        $this->Output($p['_uuid'] . '.pdf', 'D');
    }
}
