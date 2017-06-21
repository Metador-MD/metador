<?php

namespace Plugins\WhereGroup\MapBundle\Controller;

//use Plugins\WhereGroup\MapBundle\Component\XmlUtils\EXmlReader;
use Plugins\WhereGroup\MapBundle\Entity\Wms;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use ShapeFile\ShapeFile;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
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
                die($e->getMessage());
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
     * @Route("getwms", name="metador_admin_map_getwms")
     * @Method({"GET", "POST"})
     */
    public function getWmsAction()
    {
//        TODO checkAuthorizationFor for a start site user
//        $this->checkAuthorizationFor('ROLE_SYSTEM_SUPERUSER');
        $form = $this
            ->createForm(WmsNewType::class, new Wms())
            ->handleRequest($this->get('request_stack')->getCurrentRequest());
        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            try {
                $this->get('metador_map')->update($entity->getGcUrl(), $entity);

                return new JsonResponse(
                    $this->get('metador_map')->toOl4($entity)
                );
            } catch (\Exception $e) {
//                TODO flash error
            }
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
        $url      = urldecode($this->get('request_stack')->getCurrentRequest()->query->get('url'));
        $wms      = new Wms();
        $this->get('metador_map')->update($url, $wms);
        $response = new AjaxResponse($this->get('metador_map')->toOl4($wms));
        return $response;
    }

    /**
     * @return Response
     * @Route("uploadgeom/", name="metador_admin_map_uploadgeom")
     * @Method({"POST"})
     */
    public function uploadGeomAction()
    {


//        /home/paul/Customer/LVermGEO/beispiele/beisöiel1
        try {
            // Open shapefile
            $shapeFile = new ShapeFile(
                '/home/paul/Customer/LVermGEO/beispiele/beispiel1.shp',
                ShapeFile::FLAG_SUPPRESS_Z + ShapeFile::FLAG_SUPPRESS_M
            );
            $prj = $shapeFile->getPRJ();
            $type = $shapeFile->getShapeType();
            $current = $shapeFile->getCurrentRecord();
            $record = $shapeFile->getRecord();
            // Read all the records
            while ($record = $shapeFile->getRecord(ShapeFile::GEOMETRY_BOTH)) {
                if ($record['dbf']['_deleted']) continue;
                // Geometry
                print_r($record['shp']);
                // DBF Data
                print_r($record['dbf']);
            }

        } catch (ShapeFileException $e) {
            // Print detailed error information
            exit('Error '.$e->getCode().' ('.$e->getErrorType().'): '.$e->getMessage());
        }

        return new Response('aaaaaaa');
    }

    /**
     * @return Response
     * @Route("map/testaddwms", name="metador_admin_map_testadd")
     * @Method({"GET", "POST"})
     */
    public function testaddwmsAction()
    {
//        TODO remove this action
        $url      = 'http://osm-demo.wheregroup.com/service';
        $wms      = new Wms();
        $this->get('metador_map')->update($url, $wms);
        $response = new Response();
        return $response;
    }
}
