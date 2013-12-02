<?php

namespace WhereGroup\UserBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use WhereGroup\UserBundle\Entity\Group;
use WhereGroup\UserBundle\Form\GroupType;

/**
 * Group controller.
 *
 * @Route("/group")
 */
class GroupController extends Controller
{
    /**
     * Lists all Group entities.
     *
     * @Route("/", name="group")
     * @Template()
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        return array(
            'form' => $this->createForm(new GroupType(), new Group())->createView(),
            'entities' => $em->getRepository('WhereGroupUserBundle:Group')->findAll(),
        );
    }

    /**
     * Finds and displays a Group entity.
     * @Method("GET")
     * @Route("/delete/{id}", name="group_confirm")
     * @Template()
     */
    public function confirmDeleteAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('WhereGroupUserBundle:Group')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Group entity.');
        }

        return array(
            'entity'      => $entity,
            'delete_form' => $this->createDeleteForm($id)->createView(),
        );
    }

//    /**
//     * Displays a form to create a new Group entity.
//     *
//     * @Route("/new", name="group_new")
//     * @Template()
//     */
//    public function newAction()
//    {
//        $entity = new Group();
//        $form   = $this->createForm(new GroupType(), $entity);
//
//        return array(
//            'entity' => $entity,
//            'form'   => $form->createView(),
//        );
//    }

    /**
     * Creates a new Group entity.
     *
     * @Route("/create", name="group_create")
     * @Method("POST")
     * @Template("WhereGroupUserBundle:Group:new.html.twig")
     */
    public function createAction(Request $request) {
        $entity  = new Group();
        $form = $this->createForm(new GroupType(), $entity);
        $form->bind($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $roleExists = $em->getRepository('WhereGroupUserBundle:Group')->findOneBy(array('role' => $entity->getRole()));
            if(!$roleExists) {
                $em->persist($entity);
                $em->flush();
                $this->get('session')->setFlash('success', 'Gruppe erfolgreich hinzugefügt.');
            } else {
                $this->get('session')->setFlash('notice', 'Gruppe existiert bereits.');
            }

        } else {
            $this->get('session')->setFlash('warning', 'Gruppe konnte nicht hinzugefügt werden!');
        }

        return $this->redirect($this->generateUrl('group'));
    }

    /**
     * Displays a form to edit an existing Group entity.
     *
     * @Route("/edit/{id}", name="group_edit")
     * @Method("GET")
     * @Template()
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('WhereGroupUserBundle:Group')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Group entity.');
        }

        $editForm = $this->createForm(new GroupType(), $entity);

        return array(
            'entity' => $entity,
            'form'   => $editForm->createView(),
        );
    }

    /**
     * Edits an existing Group entity.
     *
     * @Route("/edit/{id}", name="group_update")
     * @Method("POST")
     * @Template("WhereGroupUserBundle:Group:edit.html.twig")
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('WhereGroupUserBundle:Group')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Group entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createForm(new GroupType(), $entity);
        $editForm->bind($request);

        if ($editForm->isValid()) {
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('group_edit', array('id' => $id)));
        }

        return array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        );
    }

    /**
     * Deletes a Group entity.
     * @Method("POST")
     * @Route("/delete/{id}", name="group_delete")
     * @Method("POST")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->bind($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('WhereGroupUserBundle:Group')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Group entity.');
            }

            $em->remove($entity);
            $em->flush();
            $this->get('session')->setFlash('success', 'Gruppe erfolgreich gelöscht.');
        }

        return $this->redirect($this->generateUrl('group'));
    }

    private function createDeleteForm($id)
    {
        return $this->createFormBuilder(array('id' => $id))
            ->add('id', 'hidden')
            ->getForm()
        ;
    }
}
