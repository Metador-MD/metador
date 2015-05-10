<?php

namespace WhereGroup\UserBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use WhereGroup\UserBundle\Entity\User;
use WhereGroup\UserBundle\Entity\Group;
use WhereGroup\UserBundle\Form\UserType;

/**
 * User controller.
 *
 * @Route("/admin/user")
 */
class UserController extends Controller
{
    /**
     * Lists all User entities.
     *
     * @Route("/", name="metador_admin_user")
     * @Template()
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('WhereGroupUserBundle:User')->findAll();

        return array(
            'entities' => $entities,
        );
    }

    /**
     * Finds and displays a User entity.
     *
     * @Route("/show/{id}", name="metador_admin_user_show")
     * @Template()
     */

    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('WhereGroupUserBundle:User')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find User entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return array(
            'entity'      => $entity,
            'delete_form' => $deleteForm->createView(),
        );
    }

    /**
     * Displays a form to create a new User entity.
     *
     * @Route("/new", name="metador_admin_user_new")
     * @Template()
     */
    public function newAction()
    {
        $entity = new User();

        $em = $this->getDoctrine()->getManager();
        $groups = $em->getRepository('WhereGroupUserBundle:Group')->findAll();

        $form = $this->createForm(new UserType(), $entity);

        return array(
            'entity' => $entity,
            'form'   => $form->createView(),
            'groups' => $groups
        );
    }

    /**
     * Creates a new User entity.
     *
     * @Route("/create", name="metador_admin_user_create")
     * @Method("POST")
     * @Template("WhereGroupUserBundle:User:new.html.twig")
     */
    public function createAction(Request $request)
    {
        $entity  = new User();
        $form = $this->createForm(new UserType(), $entity);
        $form->bind($request);

        if ($form->isValid()) {
            $encoder = $this->container->get('security.encoder_factory')->getEncoder($entity);
            $entity->setPassword(
                $encoder->encodePassword($entity->getPassword(), $entity->getSalt())
            );

            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('metador_admin_user'));
        }

        return array(
            'entity' => $entity,
            'form'   => $form->createView(),
        );
    }

    /**
     * Displays a form to edit an existing User entity.
     *
     * @Route("/edit/{id}", name="metador_admin_user_edit")
     * @Template()
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $groups = $em->getRepository('WhereGroupUserBundle:Group')->findAll();
        $entity = $em->getRepository('WhereGroupUserBundle:User')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find User entity.');
        }

        $editForm = $this->createForm(new UserType(), $entity);
        $deleteForm = $this->createDeleteForm($id);

        return array(
            'entity'      => $entity,
            'form'        => $editForm->createView(),
            'groups'      => $groups,
            'delete_form' => $deleteForm->createView(),
        );
    }

    /**
     * Edits an existing User entity.
     *
     * @Route("/update/{id}", name="metador_admin_user_update")
     * @Method("POST")
     * @Template("WhereGroupUserBundle:User:edit.html.twig")
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('WhereGroupUserBundle:User')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find User entity.');
        }

        $oldPassword = $entity->getPassword();

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createForm(new UserType(), $entity);
        $editForm->bind($request);

        if ($editForm->isValid()) {
            $encoder = $this->container->get('security.encoder_factory')->getEncoder($entity);

            if ($oldPassword != $entity->getPassword()) {
                $entity->setPassword(
                    $encoder->encodePassword($entity->getPassword(), $entity->getSalt())
                );
            }

            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('metador_admin_user'));
        }

        return array(
            'entity'      => $entity,
            'form'        => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        );
    }

    /**
     * Deletes a User entity.
     *
     * @Route("/delete/{id}", name="metador_admin_user_delete")
     * @Method("POST")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->bind($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('WhereGroupUserBundle:User')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find User entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('metador_admin_user'));
    }

    private function createDeleteForm($id)
    {
        return $this->createFormBuilder(array('id' => $id))
            ->add('id', 'hidden')
            ->getForm()
        ;
    }
}
