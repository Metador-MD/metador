<?php

namespace WhereGroup\MetadorBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

use Rhumsaa\Uuid\Uuid;
use Rhumsaa\Uuid\Exception\UnsatisfiedDependencyException;

use WhereGroup\MetadorBundle\Entity\Metadata;
use WhereGroup\MetadorBundle\Entity\Helptext;
use WhereGroup\MetadorBundle\Entity\Address;
use WhereGroup\MetadorBundle\Event\MetadataChangeEvent;
use WhereGroup\MetadorBundle\Component\XmlParser;
use WhereGroup\MetadorBundle\Component\XmlParserFunctions;

/**
 * @Route("/import")
 */
class ImportController extends Controller
{
    /**
     * @Route("/", name="import_index")
     * @Template()
     */
    public function indexAction()
    {
        return array();
    }

    /**
     * @Route("/xml_import", name="xml_upload")
     * @Method("POST")
     */
    public function xmlUploadAction()
    {
        foreach ($this->getRequest()->files as $file) {

            if (!is_object($file)) {
                $this->get('session')->getFlashBag()->add('error', 'Bitte XML-Datei angeben.');
                return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
            }

            $path = $file->getPath() . '/' . $file->getClientOriginalName();

            $file->move(
                $file->getPath(),
                $file->getClientOriginalName()
            );

            if ($file->getClientOriginalExtension() === 'xml') {
                $xml = file_get_contents($path);

                $import = $this->get('metadata_import');

                $p = $import->load(
                    $xml,
                    $this->container->getParameter('metador')
                );

                $metadata = $this->get('metador_metadata');
                $metadata->saveObject($p);

                $this->get('session')->getFlashBag()->add('info', 'Erfolgreich importiert.');
            }
        }

        return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
    }

    /**
     * @Route("/wms_url_import", name="wms_url_import")
     * @Method("POST")
     */
    public function wmsUrlImportAction()
    {
        preg_match_all(
            "/(htt[^\n]+)/i",
            $this->get('request')->request->get('urls', ''),
            $matches
        );

        if (!isset($matches[1]) || empty($matches[1])) {
            $this->get('session')->getFlashBag()->add('error', 'Bitte mindestens eine GetCapabilities URL angeben.');
            return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
        }

        $conf = $this->container->getParameter('metador');
        $import = $this->get('metadata_import');

        foreach ($matches[1] as $url) {
            if (!(bool)parse_url(trim($url))) {
                $this->get('session')->getFlashBag()->add('error', 'Keine gültige URL.');
                continue;
            }

            try {
                $xml = @file_get_contents(trim($url));
            } catch (\Exception $e) {
                $this->get('session')->getFlashBag()->add('error', 'Keine gültige URL.');
                continue;
            }

            try {
                $p = $import->loadWMS($xml, $conf);
            } catch (\Exception $e) {
                $this->get('session')->getFlashBag()->add('error', 'URL liefert keine gültige XML.');
                continue;
            }


            if (empty($p)) {
                $this->get('session')->getFlashBag()->add('error', 'GetCapabilities konnte nicht bearbeitet werden.');
            } else {
                try {
                    $p['fileIdentifier'] = Uuid::uuid4()->toString();
                    $p['identifier'][0]['code'] = $p['fileIdentifier'];
                    $p['identifier'][0]['codespace'] = "";

                    $p['dateStamp'] = date('Y-m-d');
                    $p['hierarchyLevel'] = 'service';

                    $metadata = $this->get('metador_metadata');
                    $metadata->saveObject($p);

                } catch (UnsatisfiedDependencyException $e) {
                    $this->get('session')->getFlashBag()->add('error', 'UUID konnte nicht generiert werden.');
                    return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
                }
            }
        }

        return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
    }
}
