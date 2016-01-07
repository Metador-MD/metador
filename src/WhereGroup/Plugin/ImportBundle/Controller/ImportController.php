<?php

namespace WhereGroup\Plugin\ImportBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ImportControllerController
 * @package WhereGroup\Plugin\ImportBundle\Controller
 * @author A.R.Pour
 * @Route("/import/")
 */
class ImportController extends Controller
{
    /**
     * @Route("{profile}/", name="metador_import_index")
     * @Method("GET")
     * @Template()
     */
    public function indexAction($profile)
    {
        return array(
            'profile' => $profile
        );
    }

    /**
     * @Route("{profile}/xml/", name="metador_import_xml")
     * @Method("POST")
     */
    public function xmlAction(Request $request, $profile)
    {
        /** @var UploadedFile $file */
        foreach ($request->files as $file) {
            if (!$file instanceof UploadedFile) {
                $this->get('session')->getFlashBag()->add('error', 'Bitte XML-Datei angeben.');
                return $this->redirect($this->generateUrl('metador_dashboard'));
            }

            $path = $file->getPath() . '/' . $file->getClientOriginalName();

            $file->move($file->getPath(), $file->getClientOriginalName());

            if ($file->getClientOriginalExtension() === 'xml') {
                $xml = file_get_contents($path);

                $p   = $this->get('metadata_import')->load($xml, $profile);

                if (!empty($p)) {
                    $p['_profile'] = $profile;
                    $this->get('metadata')->saveObject($p);
                    $this->get('session')->getFlashBag()->add('info', 'Erfolgreich importiert.');
                } else {
                    $this->get('session')->getFlashBag()->add('error', 'Keine Daten gefunden.');
                }
            }
        }

        return $this->redirect($this->generateUrl('metador_dashboard'));
    }

    /**
     * @Route("test/{profile}/{id}", name="metador_import_test")
     * @Template()
     */
    public function testAction($profile, $id)
    {
        $metadata = $this->get('metadata')->getById($id);
        $object1  = $metadata->getObject();
        $object2  = $this->get('metadata_import')->load(
            $this->get('templating')->render(
                "Profile" . ucfirst(strtolower($profile)) . "Bundle:Export:metadata.xml.twig",
                array("p" => $object1)
            ),
            ucfirst(strtolower($profile))
        );

        $object2['_profile'] = $profile;

        $arr1 = array();
        $arr2 = array();
        $this->flatten($object1, $arr1);
        $this->flatten($object2, $arr2);

        return array(
            'result' => $this->test($arr1, $arr2)
        );
    }

    /**
     * @param $array
     * @return string
     */
    private function test($arr1, $arr2)
    {
        ksort($arr1);
        ksort($arr2);

        $result = array(
            'status' => 1,
            'data'   => array()
        );

        foreach ($arr1 as $key => $value) {
            if (isset($arr2[$key]) && $value === $arr2[$key] && $value !== "") {
                $result['data'][$key] = 1;
            } else {
                $result['data'][$key] = 0;
                $result['status'] = 0;
            }
        }

        return $result;
    }

    private function flatten($array, &$result, $prefix = null)
    {
        foreach ($array as $key => $value) {
            if (!is_null($prefix)) {
                $key = $prefix . '_' . $key;
            }

            if (is_array($value)) {
                $this->flatten($value, $result, $key);
            } else {
                $result[$key] = $value;
            }
        }
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
     * @Route("{profile}/wms_url_import", name="wms_url_import")
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
