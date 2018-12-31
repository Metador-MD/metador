<?php

namespace Plugins\WhereGroup\MapBundle\Controller;

use Plugins\WhereGroup\MapBundle\Entity\Wms;
use Plugins\WhereGroup\MapBundle\Form\WmsEditType;
use Plugins\WhereGroup\MapBundle\Form\WmsNewType;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\Response;

/**
 * @Route("/admin/map")
 */
class AdminController extends Controller
{
    /**
     * @Route("/", name="metador_admin_map", methods={"GET"})
     */
    public function indexAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        return $this->render('@MetadorMap/Admin/index.html.twig', array(
            'rows' => $this->get('metador_map')->all(),
        ));
    }

    /**
     * @Route("/new/", name="metador_admin_map_new", methods={"GET", "POST"})
     */
    public function newAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');
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

        return $this->render('@MetadorMap/Admin/new.html.twig', array(
            'form' => $form->createView(),
        ));
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_map_edit", methods={"GET", "POST"})
     * @param $id
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|Response
     */
    public function editAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this
            ->createForm(WmsEditType::class, $this->get('metador_map')->get($id))
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $this->get('metador_map')->save($form->getData());

            return $this->redirectToRoute('metador_admin_map');
        }

        return $this->render('@MetadorMap/Admin/new.html.twig', array(
            'form' => $form->createView(),
        ));
    }

    /**
     * @Route("/confirm/{id}", name="metador_admin_map_confirm", methods={"GET", "POST"})
     * @param $id a wms id
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|Response
     */
    public function confirmAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this->createFormBuilder($this->get('metador_map')->get($id))
            ->add('delete', SubmitType::class, array(
                'label' => 'löschen',
            ))
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            $this->get('metador_source')->remove($entity);

            return $this->redirectToRoute('metador_admin_map');
        }

        return $this->render('@MetadorMap/Admin/confirm.html.twig', array(
            'form' => $form->createView(),
        ));
    }
}
