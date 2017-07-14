<?php

namespace Plugins\WhereGroup\MapBundle\Controller;

//use Plugins\WhereGroup\MapBundle\Component\XmlUtils\EXmlReader;
use Plugins\WhereGroup\MapBundle\Entity\Wms;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use ShapeFile\ShapeFile;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use WhereGroup\CoreBundle\Component\AjaxResponse;
use Plugins\WhereGroup\MapBundle\Form\WmsNewType;
use Plugins\WhereGroup\MapBundle\Form\WmsEditType;

/**
 * Class PluginController
 * @package Plugins\WhereGroup\DatasetBundle\Controller
 * @Route("map/", name="metador_admin_map_new")
 */
class PluginController extends Controller
{
    static $crsMap = array(
        "undefined" => "EPSG:4326",
        "undefined" => "EPSG:4258",
        "undefined" => "EPSG:31466",
        "undefined" => "EPSG:31467",
        "ETRS89_UTM_zone_32N" => "EPSG:25832",
    );

    /**
     * @Route("/", name="metador_admin_map")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        return array(
            'rows' => $this->get('metador_map')->all(),
        );
    }

    /**
     * @Route("new/", name="metador_admin_map_new")
     * @Method({"GET", "POST"})
     * @Template()
     */
    public function newAction()
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');
        $wms = new Wms();
        $wms->setTitle(Wms::TITLE_DEFAULT); // set Title
        $form = $this
            ->createForm(WmsNewType::class, new Wms())
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            try {
                $this->get('metador_map')->update($entity->getGcUrl(), $entity);
                $this->get('metador_map')->save($entity);

                return $this->redirectToRoute('metador_admin_map');
            } catch (\Exception $e) {
                $this->log('error', 'create', $e->getMessage());
            }
        }

        return array(
            'form' => $form->createView(),
        );
    }

    /**
     * @Route("edit/{id}", name="metador_admin_map_edit")
     * @Method({"GET", "POST"})
     * @Template("MetadorMapBundle:Plugin:new.html.twig")
     */
    public function editAction($id)
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this
            ->createForm(WmsEditType::class, $this->get('metador_map')->get($id))
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $this->get('metador_map')->save($form->getData());

            return $this->redirectToRoute('metador_admin_map');
        }

        return array(
            'form' => $form->createView(),
        );
    }

    /**
     * @Route("confirm/{id}", name="metador_admin_map_confirm")
     * @Method({"GET", "POST"})
     * @param $id a wms id
     * @Template()
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function confirmAction($id)
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this->createFormBuilder($this->get('metador_map')->get($id))
            ->add('delete', 'submit', array(
                'label' => 'löschen',
            ))
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            $this->get('metador_source')->remove($entity);

            return $this->redirectToRoute('metador_admin_map');
        }

        return array(
            'form' => $form->createView(),
        );
    }

    /**
     * @return Response
     * @Route("loadwms/", name="metador_admin_map_loadwms")
     * @Method({"GET"})
     */
    public function loadWmsAction()
    {
//        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');
        $url = urldecode($this->get('request_stack')->getCurrentRequest()->query->get('url'));
        try {
            $wms = new Wms();
            $this->get('metador_map')->update($url, $wms);

            return new AjaxResponse($this->get('metador_map')->toOl4($wms));
        } catch (\Exception $e) {
            $this->log('error', 'create', $e->getMessage(), false, false);

            $response = array();

            $this->get('metador_frontend_command')->displayError($response, $e->getMessage());

            return new AjaxResponse($response);
        }
    }

    /**
     * @return Response
     * @Route("uploadgeom/", name="metador_admin_map_uploadgeom")
     * @Method({"POST"})
     */
    public function uploadGeomAction()
    {
        $request = $this->get('request_stack')->getMasterRequest();
        $result = array("content" => null);
        /** @var UploadedFile $file */
        foreach ($request->files as $file) {
            if (!$file instanceof UploadedFile) {
                return new Response('Keine Datei hochgeladen!');
            }
            if ($file->getClientOriginalExtension() === 'xml') {
                $a = $file->getRealPath();
            } elseif ($file->getClientOriginalExtension() === 'zip') {
                $zip = new \ZipArchive;
                if ($zip->open($file->getRealPath()) !== true) {
                    return new Response('Die Datei kann nicht entzippt werden!');
                }
                $kernelPath = $this->get('kernel')->getRootDir();
                $tempPath = $kernelPath.'/../var/temp/';

                $tempFolder = $tempPath.$file->getFilename();
                $zip->extractTo($tempFolder);
                $zip->close();
                try {
                    // Read all shapefiles
                    $shapeFile = new ShapeFile(
                        substr($tempFolder.'/'.$file->getClientOriginalName(), 0, -4),
                        ShapeFile::FLAG_SUPPRESS_Z + ShapeFile::FLAG_SUPPRESS_M
                    );
                    $prj = $shapeFile->getPRJ();
                    $epsg = $this->findCrs($prj);
                    $shtype = $shapeFile->getShapeType();
                    $current = $shapeFile->getCurrentRecord();
                    $record = $shapeFile->getRecord(ShapeFile::GEOMETRY_BOTH);
                    $shape_types = $this->supportedTypes();
                    if (!isset($shape_types[$shtype])) {
                        throw new \Exception('Der Geometrietyp ist nicht unterstützt.');
                    }
                    $type = $shape_types[$shtype];
                    $coords = $this->shGeomToJson($type, $record['shp']['parts'][0]);
                    if ($coords === null) {
                        throw new \Exception('Die Geometrie kann nicht ausgelesen werden.');
                    }
                    $result['content'] = array(
                        "type" => "FeatureCollection",
                        "bbox" => $record['shp']['bounding_box'],
                        "features" => array(
                            "type" => $type,
                            "coordinates" => $coords
                        ),
                    );
                } catch (\Exception $e) {
                    $result = array('status' => 'error', 'message' => $e->getMessage());
                } finally {
                    // remove all uploaded files
                    $fs = new Filesystem();
                    $fs->remove($file->getRealPath());
                    $this->delTree($tempFolder);
                }
            }
            break; // only first file
        }
        return new AjaxResponse($result);
//
////        /home/paul/Customer/LVermGEO/beispiele/beisöiel1
//        try {
//            // Open shapefile
//
//            $shapeFile = new ShapeFile(
//                '/home/paul/Customer/LVermGEO/beispiele/beispiel1.shp',
//                ShapeFile::FLAG_SUPPRESS_Z + ShapeFile::FLAG_SUPPRESS_M
//            );
//            $prj = $shapeFile->getPRJ();
//            $type = $shapeFile->getShapeType();
//            $current = $shapeFile->getCurrentRecord();
//            $record = $shapeFile->getRecord();
//            $shp = $record['shp'];
//            // Read all the records
//            while ($record = $shapeFile->getRecord(ShapeFile::GEOMETRY_BOTH)) {
//                if ($record['dbf']['_deleted']) {
//                    continue;
//                }
//                // Geometry
//                print_r($record['shp']);
//                // DBF Data
//                print_r($record['dbf']);
//            }
//
//        } catch (ShapeFileException $e) {
//            // Print detailed error information
//            exit('Error '.$e->getCode().' ('.$e->getErrorType().'): '.$e->getMessage());
//        }
//
//        return new Response('aaaaaaa');
    }

    /**
     * @return Response
     * @Route("map/testaddwms", name="metador_admin_map_testadd")
     * @Method({"GET", "POST"})
     */
    public function testaddwmsAction()
    {
//        TODO remove this action
        $url = 'http://osm-demo.wheregroup.com/service';
        $wms = new Wms();
        $this->get('metador_map')->update($url, $wms);
        $response = new Response();

        return $response;
    }

    /**
     * Creates a flush message.
     * @param $type log type
     * @param $operation operation
     * @param $message message to log
     */
    private function log($type, $operation, $message, $addUser = true, $flash = true)
    {
        $log = $this->get('metador_logger')->newLog();

        $log
            ->setFlashMessage($flash)
            ->setType($type)
            ->setCategory('application')
            ->setSubcategory('map')
            ->setOperation($operation)
            ->setMessage($message);
        if ($addUser) {
            $log->setUser($this->get('metador_user')->getUserFromSession());
        }

        $this->get('metador_logger')->set($log);

    }

    private function findCrs($projDef)
    {
        $help = $this->prepareStr($projDef);
        foreach (self::$crsMap as $key => $epsg) {
            if (strpos($help, $this->prepareStr($key)) !== false) {
                return $epsg;
            }
        }

        return 'undefined';
    }

    private function prepareStr($str)
    {
        return preg_replace('/[^0-9a-z]/', '', $str);
    }

    private function delTree($dir)
    {
        $files = array_diff(scandir($dir), array('.', '..'));
        foreach ($files as $file) {
            (is_dir("$dir/$file")) ? delTree("$dir/$file") : unlink("$dir/$file");
        }

        return rmdir($dir);
    }
//
//    private function typeForShType($shtype)
//    {
//        $shape_types = array(
////            0   => 'Null Shape',
//            1 => 'Point',
//            3 => 'LineString',//'PolyLine',
//            5 => 'Polygon',
////            8   => 'MultiPoint',
////            11  => 'PointZ',
////            13  => 'PolyLineZ',
////            15  => 'PolygonZ',
////            18  => 'MultiPointZ',
////            21  => 'PointM',
////            23  => 'PolyLineM',
////            25  => 'PolygonM',
////            28  => 'MultiPointM'
//        );
//
//        return in_array($shtype, $shape_types) ? $shape_types[$shtype] : null;
//    }

    private function shGeomToJson($type, $part)
    {
        switch ($type) {
            case 'LineString':
                $res = array();
                foreach ($part['points'] as $point) {
                    $res[] = array($point['x'], $point['y']);
                }
                return $res;
            default:
                return null;
        }
    }

    private function supportedTypes()
    {
        return array(
//            0   => 'Null Shape',
            1 => 'Point',
            3 => 'LineString',//'PolyLine',
            5 => 'Polygon',
//            8   => 'MultiPoint',
//            11  => 'PointZ',
//            13  => 'PolyLineZ',
//            15  => 'PolygonZ',
//            18  => 'MultiPointZ',
//            21  => 'PointM',
//            23  => 'PolyLineM',
//            25  => 'PolygonM',
//            28  => 'MultiPointM'
        );
    }
}
