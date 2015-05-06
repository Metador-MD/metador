<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\CoreBundle\Entity\Helptext;
use WhereGroup\CoreBundle\Entity\Address;
use WhereGroup\CoreBundle\Event\MetadataChangeEvent;

/**
 * @Route("/metador/import")
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
                return $this->redirect($this->generateUrl('metador_dashboard'));
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

        return $this->redirect($this->generateUrl('metador_dashboard'));
    }

    /**
     * @Route("/wms_url_override", name="wms_url_override")
     * @Method("POST")
     */
    public function overrideWmsAction()
    {
        $services = $this->get('request')->request->get('services', array());
        $wmsImport   = $this->get('wms_import');

        foreach ($services as $uuid => $service) {
            if (isset($service['override']) && $service['override'] == 1) {
                if (!($p = $wmsImport->isGetCapabilitiesUrl($service['url']))) {
                    $this->get('session')->getFlashBag()->add(
                        'error',
                        $url . 'ist keine gültige URL bzw. liefert keine gültige WMS GetCapabilities XML.'
                    );
                    continue;
                }

                $wmsImport->update($p, $uuid, $service['id']);
            }
        }

        return $this->redirect($this->generateUrl('metador_dashboard'));
    }

    /**
     * @Route("/wms_url_import", name="wms_url_import")
     * @Method("POST")
     * @Template()
     */
    public function wmsUrlImportAction()
    {
        $info = array();
        $update = false;

        $wmsImport = $this->get('wms_import');

        // Parse URL's
        $urls = $wmsImport->parseGetCapabilitiesUrls(
            $this->get('request')->request->get('urls', '')
        );

        if (!$urls) {
            $this->get('session')->getFlashBag()->add('error', 'Bitte mindestens eine GetCapabilities URL angeben.');
            return $this->redirect($this->generateUrl('metador_dashboard'));
        }

        foreach ($urls as $url) {
            if (!($p = $wmsImport->isGetCapabilitiesUrl($url))) {
                $this->get('session')->getFlashBag()->add(
                    'error',
                    $url . 'ist keine gültige URL bzw. liefert keine gültige WMS GetCapabilities XML.'
                );
                continue;
            }

            $uuid = $wmsImport->convertUrlToUuid($url);

            if (!$uuid) {
                $this->get('session')->getFlashBag()->add('error', 'UUID konnte nicht generiert werden.');
                return $this->redirect($this->generateUrl('metador_dashboard'));
            }

            if ($id = $wmsImport->metadataExists($uuid)) {
                $update = true;

                $info[$uuid] = array(
                    'title'     => $p['title'],
                    'url'       => $url,
                    'id'        => $id,
                    'processed' => false
                );

            } else {
                $wmsImport->insert($p, $uuid);

                $info[$uuid] = array(
                    'title'     => $p['title'],
                    'url'       => $url,
                    'processed' => true
                );
            }
        }

        if ($update) {
            return array(
                'services' => $info
            );
        }

        return $this->redirect($this->generateUrl('metador_dashboard'));
    }
}
