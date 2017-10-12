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
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use ShapeFile\ShapeFile;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use WhereGroup\CoreBundle\Component\AjaxResponse;

/**
 * @Route("/admin/map")
 */
class AdminController extends Controller
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
     * @Route("/new/", name="metador_admin_map_new")
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
     * @Route("/edit/{id}", name="metador_admin_map_edit")
     * @Method({"GET", "POST"})
     * @Template("MetadorMapBundle:Admin:new.html.twig")
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
     * @Route("/confirm/{id}", name="metador_admin_map_confirm")
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
}
