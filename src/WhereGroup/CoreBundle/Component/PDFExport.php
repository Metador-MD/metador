<?php

namespace WhereGroup\CoreBundle\Component;

use Dompdf\Dompdf;

class PDFExport
{
    protected $uuid;

    public function setUUID($uuid)
    {
        $this->uuid = $uuid;
    }

    public function createPdf($html, $p)
    {
        $dompdf = new Dompdf();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();
        $dompdf->stream($p['_uuid'] . '.pdf', [ "Attachment" => false ]);
        exit(0);
    }
}
