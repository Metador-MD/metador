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
 * @Route("/admin/group")
 */
class GroupController extends Controller
{
    const REPOSITORY = 'WhereGroupUserBundle:Group';

    /**
     * @Route("/", name="metador_admin_group")
     * @Template()
     */
    public function indexAction()
    {
        return array(
            'groups' => $this
                ->getRepository()
                ->findAllSorted(),
        );
    }

    /**
     *
     * @Route("/new/", name="metador_admin_group_new")
     * @Method("GET")
     * @Template()
     */
    public function newAction()
    {
        return array(
            'form' => $this
                ->createForm(new GroupType(), new Group())
                ->createView(),
            'users' => $this
                ->getRepository('WhereGroupUserBundle:User')
                ->findAll()
        );
    }

    /**
     * @Route("/create", name="metador_admin_group_create")
     * @Method("POST")
     * @Template("WhereGroupUserBundle:Group:new.html.twig")
     */
    public function createAction(Request $request)
    {
        $entity  = new Group();
        $form = $this->createForm(new GroupType(), $entity);
        $form->bind($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $roleExists = $this
                ->getRepository()
                ->findOneBy(array('role' => $entity->getRole()));

            if (!$roleExists) {
                $em->persist($entity);
                $em->flush();

                $this->addFlash('success', 'Gruppe erfolgreich hinzugefügt.');
            } else {
                $this->addFlash('warning', 'Gruppe existiert bereits.');
            }

        } else {
            $this->addFlash('warning', 'Gruppe konnte nicht hinzugefügt werden!');
        }

        return $this->redirect($this->generateUrl('metador_admin_group'));
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_group_edit")
     * @Method("GET")
     * @Template("WhereGroupUserBundle:Group:new.html.twig")
     */
    public function editAction($id)
    {
        return array(
            'form' => $this
                ->createForm(new GroupType(), $this->getGroup($id))
                ->createView(),
            'users' => $this
                ->getRepository('WhereGroupUserBundle:User')
                ->findAll()
        );
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_group_update")
     * @Method("POST")
     * @Template("WhereGroupUserBundle:Group:new.html.twig")
     */
    public function updateAction(Request $request, $id)
    {
        $form = $this
            ->createForm(new GroupType(), $this->getGroup($id))
            ->submit($request);

        // die('<pre>' . print_r($request->request->all(), 1) . '</pre>');

        if ($form->isValid()) {
            $group = $form->getData();

            // See method documentation for Doctrine weirdness
            // foreach ($group->getUsers() as $user) {
            //     $user->addGroup($group);
            // }
            $this->getDoctrine()->getManager()->persist($group);


            // die("sd");

            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('metador_admin_group');
        }

        return array('form' => $form);
    }

    /**
     * @Method("GET")
     * @Route("/delete/{id}", name="metador_admin_group_confirm")
     * @Template()
     */
    public function confirmAction($id)
    {
        return array(
            'form' => $this
                ->createDeleteForm($id)
                ->createView()
        );
    }

    /**
     * @Route("/delete/{id}", name="metador_admin_group_delete")
     * @Method("POST")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this
            ->createDeleteForm($id)
            ->submit($request);

        if ($form->isValid()) {
            $entity = $this->getRepository()->findOneById($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Group entity.');
            }

            $em = $this->getDoctrine()->getManager();
            $em->remove($entity);
            $em->flush();

            $this->addFlash('success', 'Gruppe erfolgreich gelöscht.');
        }

        return $this->redirect($this->generateUrl('metador_admin_group'));
    }

    private function createDeleteForm($id)
    {
        return $this
            ->createFormBuilder(array('id' => $id))
            ->add('id', 'hidden')
            ->add('submit', 'submit', array('label' => 'löschen'))
            ->getForm();
    }

    private function getRepository($repository = null)
    {
        return $this
            ->getDoctrine()
            ->getManager()
            ->getRepository(is_null($repository) ? self::REPOSITORY : $repository);
    }

    private function getGroup($id)
    {
        $entity = $this
            ->getRepository()
            ->findOneById($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Group entity.');
        }

        return $entity;
    }
}
