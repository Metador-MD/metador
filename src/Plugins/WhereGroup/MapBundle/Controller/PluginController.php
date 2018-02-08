<?php

namespace Plugins\WhereGroup\MapBundle\Controller;

use Plugins\WhereGroup\MapBundle\Component\XmlUtils\EXmlReader;
use Plugins\WhereGroup\MapBundle\Component\XmlUtils\FeatureJsonWriter;
use Plugins\WhereGroup\MapBundle\Component\XmlUtils\XmlAssocArrayReader;
use Plugins\WhereGroup\MapBundle\Entity\Wms;
use Plugins\WhereGroup\MapBundle\Form\WmsEditType;
use Plugins\WhereGroup\MapBundle\Form\WmsNewType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use ShapeFile\ShapeFile;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use WhereGroup\CoreBundle\Component\AjaxResponse;

/**
 * Class PluginController
 * @package Plugins\WhereGroup\DatasetBundle\Controller
 * @Route("/map")
 */
class PluginController extends Controller
{
    public static $shapeSupportedTypes = array(
        1 => 'Point',
        3 => 'LineString',//'PolyLine',
        5 => 'Polygon',
    );

    /**
     * @return Response
     * @Route("/loadwms/", name="metador_map_loadwms")
     * @Method({"GET"})
     */
    public function loadWmsAction()
    {
        $url = urldecode($this->get('request_stack')->getCurrentRequest()->query->get('url'));
        try {
            $wms = new Wms();
            $this->get('metador_map')->update($url, $wms);

            return new AjaxResponse($this->get('metador_map')->toOl4($wms));
        } catch (\Exception $e) {
            $this->log('error', 'create', $e->getMessage(), false, false);

            $result = array();

            $this->get('metador_frontend_command')->displayError($result, $e->getMessage());

            return new AjaxResponse($result);
        }
    }

    /**
     * @return Response
     * @Route("/uploadgeom/", name="metador_map_uploadgeom")
     * @Method({"POST"})
     */
    public function uploadGeomAction()
    {
        $request = $this->get('request_stack')->getMasterRequest();
        $result = array(
            'content' => null,
        );
        if ($request->files->count() === 0) {
            $this->get('metador_frontend_command')->displayError(
                $result,
                'Keine Datei wurde hochgeladen bzw. die Datei ist zu groß.'
            );
        }
        /** @var UploadedFile $file */
        foreach ($request->files as $file) {
            if (!$file instanceof UploadedFile) {
                return new Response('Die Hochgeladene Datei kann nicht gefunden werden.');
            }
            if ($file->getClientOriginalExtension() === 'xml' || $file->getClientOriginalExtension() === 'gml') {
                $reader = EXmlReader::create($file->getRealPath());
                $map = array('wfs:member', 'gml:featureMember');
                $reader->addReader($map, new XmlAssocArrayReader($reader, new FeatureJsonWriter()));
                $result['content'] = array(
                    "type" => "FeatureCollection",
                    "features" => array(),
                );
                try {
                    while ($reader->readComponent()) {
                        $result['content']['features'][] = $reader->getContent();
                        if (!isset($result['content']['crs']) && isset($result['content']['features'][0]['crs'])) {
                            $result['content']['crs'] = $result['content']['features'][0]['crs'];
                        }
                        break; // only first geometry
                    }
                } catch (\Exception $e) {
                    $result['content'] = null;
                    $this->get('metador_frontend_command')->displayError($result, $e->getMessage());
                } finally {
                    $reader->close();
                }
            } elseif ($file->getClientOriginalExtension() === 'zip') {
                $zip = new \ZipArchive;
                if ($zip->open($file->getRealPath()) !== true) {
                    return new Response('Die Datei kann nicht entzippt werden.');
                }
                $kernelPath = $this->get('kernel')->getRootDir();
                $tempPath = $this->getParameter('metador_temp_dir');

                $tempFolder = $tempPath.$file->getFilename();
                $zip->extractTo($tempFolder);
                $zip->close();
                try {
                    $onlyName = substr($file->getClientOriginalName(), 0, -4);
                    $files = $this->findFiles($tempFolder, $onlyName.'.shp');
                    if (count($files) === 0) {
                        throw new \Exception('Die Shape Datei "'.$onlyName.'.shp'.'" ist nicht vorhanden.', 0);
                    }
                    $basicName = substr($tempFolder.'/'.$files[0], 0, -4);
                    $shapes = [
                        'shp' => $this->getFileName($basicName, '.shp'),
                        'shx' => $this->getFileName($basicName, '.shx'),
                        'dbf' => $this->getFileName($basicName, '.dbf'),
                        'prj' => $this->getFileName($basicName, '.prj'),
                    ];
                    // Read all shapefiles
                    $shapeFile = new ShapeFile($shapes, ShapeFile::FLAG_SUPPRESS_Z + ShapeFile::FLAG_SUPPRESS_M);
                    $prj = $shapeFile->getPRJ();
                    $epsg = $this->findCrs($prj);
                    if ($epsg === null) {
                        throw new \Exception('Das Koordinatenreferenzsystem kann nicht ermittelt werden'
                            .' bzw. ist nicht unterstützt.');
                    }
                    $shtype = $shapeFile->getShapeType();
                    if (!isset(self::$shapeSupportedTypes[$shtype])) {
                        throw new \Exception('Der Geometrietyp ist nicht unterstützt:'.$shtype);
                    }
                    $type = self::$shapeSupportedTypes[$shtype];
                    $result['content'] = array(
                        "type" => "FeatureCollection",
                        "crs" => array(
                            "type" => "name",
                            "properties" => array(
                                "name" => $epsg,
                            ),
                        ),
                        "features" => array(),
                    );
                    foreach ($shapeFile as $i => $record) {
                        if ($record['dbf']['_deleted']) {
                            continue;
                        }
                        $coords = $this->shGeomToJson($type, $record['shp']['parts'][0]);
                        if ($coords === null) {
                            throw new \Exception('Die Geometrie kann nicht ausgelesen werden.');
                        }
                        $result['content']['features'][] = array(
                            "type" => "Feature",
                            "geometry" => array(
                                "type" => $type,
                                "coordinates" => $coords,
                            ),
                            "properties" => array(),
                        );
                        break; // only first geometry
                    }
                } catch (\Exception $e) {
                    switch ($e->getCode()) {
                        case 0:
                            $this->get('metador_frontend_command')->displayError($result, $e->getMessage());
                            break;
                        default:
                            $this->get('metador_frontend_command')->displayError(
                                $result,
                                "Die Shape Datei kann nicht ausgelesen werden: ".$e->getMessage()
                            );
                    }
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
    }

    private function getFileName($basicPath, $extension)
    {
        $file = $basicPath.$extension;
        if (file_exists($file)) {
            return $file;
        } else {
            throw new \Exception('Die Datei "'.$file.'" ist nicht vorhanden', 0);
        }
    }

    /**
     * @param string $dirPath
     * @param string $fileRegex
     * @return array
     */
    private function findFiles($dirPath, $fileRegex)
    {
        $matchedfiles = array();
        $all = opendir($dirPath);
        while ($file = readdir($all)) {
            if (is_file($dirPath.'/'.$file) && strpos(strtolower($file), strtolower($fileRegex)) !== false) {
                $matchedfiles[] = $file;
            }
        }
        closedir($all);

        return $matchedfiles;
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

    /**
     * @param string $projDef
     * @return string|null
     * @throws \Exception
     */
    private function findCrs($projDef)
    {
        $help = $this->prepareStr($projDef);
        $map = $this->getParameter('map_shape_epsg');
        if ($map === null) {
            throw new \Exception('Kein Koordinatreferenzsystem ist vorhanden.');
        }
        foreach ($map as $key => $epsg) {
            if (strpos($help, $this->prepareStr($key)) !== false) {
                return $epsg;
            }
        }

        return null;
    }

    /**
     * @param string $str
     * @return mixed
     */
    private function prepareStr($str)
    {
        return preg_replace('/[^0-9a-z]/', '', $str);
    }

    /**
     * @param string $dir
     * @return bool
     */
    private function delTree($dir)
    {
        $files = array_diff(scandir($dir), array('.', '..'));
        foreach ($files as $file) {
            (is_dir("$dir/$file")) ? delTree("$dir/$file") : unlink("$dir/$file");
        }

        return rmdir($dir);
    }

    /**
     * @param string $type
     * @param array $part
     * @return array|null
     */
    private function shGeomToJson($type, $part)
    {
        switch ($type) {
            case 'LineString':
                $res = array();
                foreach ($part['points'] as $point) {
                    $res[] = array($point['x'], $point['y']);
                }

                return $res;
            case 'Polygon':
                $rings = array();
                foreach ($part['rings'] as $item) {
                    $ring = array();
                    foreach ($item['points'] as $point) {
                        $ring[] = array($point['x'], $point['y']);
                    }
                    $rings[] = $ring;
                }

                return $rings;
            default:
                return null;
        }
    }
}
