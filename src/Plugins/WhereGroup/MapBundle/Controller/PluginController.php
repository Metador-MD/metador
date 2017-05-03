<?php

namespace Plugins\WhereGroup\MapBundle\Controller;

use Plugins\WhereGroup\MapBundle\Entity\Wms;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use WhereGroup\CoreBundle\Form\WmsNewType;

/**
 * Class PluginController
 * @package Plugins\WhereGroup\DatasetBundle\Controller
 */
class PluginController extends Controller
{
    /**
     * @Route("map/index", name="map_wms_index")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        $this->checkAuthorizationFor('ROLE_SYSTEM_SUPERUSER');

        return array(
            'sources' => $this->get('map_wms')->all(),
        );
    }

    /**
     * @Route("map/newwms", name="map_wms_new")
     * @Method({"GET", "POST"})
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newWmsAction()
    {
        $this->checkAuthorizationFor('ROLE_SYSTEM_SUPERUSER');
        $form = $this
            ->createForm(WmsNewType::class, new Wms())
            ->handleRequest($this->get('request_stack')->getCurrentRequest());
        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            try {
                $this->get('map_wms')->update($entity->getGcUrl(), $entity);
                $this->get('map_wms')->save($entity);
//            $this->setFlashSuccess(
//                'edit',
//                $entity->getId(),
//                'Wms %wms% erfolgreich erstellt.',
//                array('%wms%' => $entity->getName())
//            );
                return $this->redirectToRoute('map_wms_index');
            } catch (\Exception $e) {
//                TODO flash error
            }
        }

        return array(
            'form' => $form->createView(),
        );
    }


    /**
     * @Route("map/updatewms/{id}", name="map_wms_update")
     * @Method({"GET", "POST"})
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function updateWmsAction($id)
    {
        $this->checkAuthorizationFor('ROLE_SYSTEM_SUPERUSER');
        $form = $this
            ->createForm(WmsNewType::class, $this->get('map_wms')->get($id))
            ->handleRequest($this->get('request_stack')->getCurrentRequest());
        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            try {
                $this->get('map_wms')->update($entity->getGcUrl(), $entity);
                $this->get('map_wms')->save($entity);
//            $this->setFlashSuccess(
//                'edit',
//                $entity->getId(),
//                'Wms %wms% erfolgreich erstellt.',
//                array('%wms%' => $entity->getName())
//            );
                return $this->redirectToRoute('map_wms_index');
            } catch (\Exception $e) {
//                TODO flash error
            }
        }

        return array(
            'form' => $form->createView(),
        );
    }

    /**
     * @Route("map/editwms/{id}", name="map_wms_edit")
     * @Method({"GET", "POST"})
     * @param $id a wms id
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function editWmsAction($id)
    {
        $this->checkAuthorizationFor('ROLE_SYSTEM_SUPERUSER');
        $form = $this
            ->createForm(WmsEditType::class, $this->get('map_wms')->get($id))
            ->handleRequest($this->get('request_stack')->getCurrentRequest());
        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            $this->get('map_wms')->save($entity);
//            $this->setFlashSuccess(
//                'edit',
//                $entity->getId(),
//                'Wms %wms% erfolgreich bearbeitet.',
//                array('%wms%' => $entity->getName())
//            );
            return $this->redirectToRoute('map_wms_index');
        }

        return array(
            'form' => $form->createView(),
        );
    }

    /**
     * @Route("map/confirm/{id}", name="map_wms_confirm")
     * @Method({"GET", "POST"})
     * @param $id a wms id
     * @Template()
     */
    public function confirmAction($id)
    {
        $this->checkAuthorizationFor('ROLE_SYSTEM_SUPERUSER');

        $form = $this->createFormBuilder($this->get('map_wms')->get($id))
            ->add('delete', 'submit', array(
                'label' => 'löschen',
            ))
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            $name = $entity->getTitle();
            $id = $entity->getId();

            $this->get('metador_source')->remove($entity);

//            $this->setFlashSuccess(
//                'edit',
//                $id,
//                'WMS %wms% erfolgreich gelöscht.',
//                array('%wms%' => $name)
//            );

            return $this->redirectToRoute('map_wms_index');
        }

        return array(
            'form' => $form->createView(),
        );
    }

    /**
     * @return Response
     * @Route("map/getwms", name="map_wms_getwms")
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
                $this->get('map_wms')->update($entity->getGcUrl(), $entity);

                return new JsonResponse(
                    $this->get('map_wms')->toOl4($entity)
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
     * @Route("map/testaddwms", name="map_wms_testadd")
     * @Method({"GET", "POST"})
     */
    public function testaddwmsAction()
    {
//        TODO remove this action
        $url = 'http://osm-demo.wheregroup.com/service?';
        $wms = $this->get('map_wms')->update($url, new Wms());
        $response = new Response();

        return $response;
    }
}
