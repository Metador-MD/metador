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
        $url = $this->get('request')->request->get('url', null);

        if (empty($url)) {
            $this->get('session')->getFlashBag()->add('error', 'Bitte GetCapabilities URL angeben.');
            return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
        }

        $conf = $this->container->getParameter('metador');
        $xml = file_get_contents($url);

        // auslesen der WMS Version
        $this->parser = new XmlParser($xml, new XmlParserFunctions());
        $this->parser->loadSchema(file_get_contents($conf['wmsimport']['path'] . 'wmsversion.json'));
        $version = $this->parser->parse();

        $this->parser = new XmlParser($xml, new XmlParserFunctions());

        switch($version["version"]) {
            case "1.1.1":
                $this->parser->loadSchema(file_get_contents($conf['wmsimport']['path'] . 'wms_1-1-1.json'));
                break;
            case "1.3.0":
                $this->parser->loadSchema(file_get_contents($conf['wmsimport']['path'] . 'wms_1-3-0.json'));
                break;
        }

        $array = $this->parser->parse();

        if (isset($array['p'])) {

            try {
                $array['p']['fileIdentifier'] = Uuid::uuid4()->toString();
                $array['p']['identifier'][0]['code'] = $array['p']['fileIdentifier'];
                $array['p']['identifier'][0]['codespace'] = "";

            } catch (UnsatisfiedDependencyException $e) {
                $this->get('session')->getFlashBag()->add('error', 'UUID konnte nicht generiert werden.');
                return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
            }

            $array['p']['dateStamp'] = date('Y-m-d');
            $array['p']['hierarchyLevel'] = 'service';


            $metadata = $this->get('metador_metadata');
            $metadata->saveObject($array['p']);
            $this->get('session')->getFlashBag()->add('info', 'Erfolgreich importiert.');
        }

        return $this->redirect($this->generateUrl('wheregroup_metador_default_index'));
    }
}
