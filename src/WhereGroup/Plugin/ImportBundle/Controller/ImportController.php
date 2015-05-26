<?php

namespace WhereGroup\Plugin\ImportBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class ImportControllerController
 * @package WhereGroup\Plugin\ImportBundle\Controller
 * @author A.R.Pour
 * @Route("/import/")
 */
class ImportController extends Controller
{
    /**
     * @Route("import/", name="metador_import_index")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        return array();
    }

    /**
     * @Route("import/xml", name="metador_import_xml")
     * @Method("POST")
     */
    public function xmlAction()
    {
        /** @var UploadedFile $file */
        foreach ($this->getRequest()->files as $file) {
            if (!$file instanceof UploadedFile) {
                $this->get('session')->getFlashBag()->add('error', 'Bitte XML-Datei angeben.');
                return $this->redirect($this->generateUrl('metador_dashboard'));
            }

            $path = $file->getPath() . '/' . $file->getClientOriginalName();

            $file->move($file->getPath(), $file->getClientOriginalName());

            if ($file->getClientOriginalExtension() === 'xml') {
                $xml = file_get_contents($path);
                $p   = $this->get('metadata_import')->load($xml);

                if (!empty($p)) {
                    $this->get('metadata')->saveObject($p);
                    $this->get('session')->getFlashBag()->add('info', 'Erfolgreich importiert.');
                } else {
                    $this->get('session')->getFlashBag()->add('error', 'Keine Daten gefunden.');
                }
            }
        }

        return $this->redirect($this->generateUrl('metador_dashboard'));
    }
}
