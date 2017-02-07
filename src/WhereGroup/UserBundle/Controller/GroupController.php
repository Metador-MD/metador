<?php

namespace WhereGroup\UserBundle\Controller;

use Symfony\Component\Form\Form;
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
    const REPOSITORY = 'MetadorUserBundle:Group';

    /**
     * @Route("/", name="metador_admin_group")
     * @Template()
     */
    public function indexAction()
    {
        $groups = $this
            ->getRepository()
            ->findAllSorted();

        return array(
            'groups' => $groups,
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
                ->getRepository('MetadorUserBundle:User')
                ->findAll()
        );
    }

    /**
     * @Route("/create", name="metador_admin_group_create")
     * @Method("POST")
     * @Template("MetadorUserBundle:Group:new.html.twig")
     */
    public function createAction(Request $request)
    {
        $entity  = new Group();
        $form = $this
            ->createForm(new GroupType(), $entity)
            ->submit($request);


        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $roleExists = $this
                ->getRepository()
                ->findOneBy(array('role' => $entity->getRole()));

            if (!$roleExists) {
                $em->persist($entity);
                $em->flush();

                $this->get('metador_logger')->success('application', 'group', 'create', 'source', $entity->getId(), 'Gruppe erfolgreich hinzugefügt.');
            } else {
                $this->get('metador_logger')->success('application', 'group', 'create', 'source', $entity->getId(), 'Gruppe existiert bereits.');
            }
        } else {
            $this->get('metador_logger')->flashWarning('application', 'group', 'create', 'source', $entity->getId(), 'Gruppe konnte nicht hinzugefügt werden!');
        }

        return $this->redirect($this->generateUrl('metador_admin_group'));
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_group_edit")
     * @Method("GET")
     * @Template("MetadorUserBundle:Group:new.html.twig")
     */
    public function editAction($id)
    {
        return array(
            'form' => $this
                ->createForm(new GroupType(), $this->getGroup($id))
                ->createView(),
            'users' => $this
                ->getRepository('MetadorUserBundle:User')
                ->findAll()
        );
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_group_update")
     * @Method("POST")
     * @Template("MetadorUserBundle:Group:new.html.twig")
     */
    public function updateAction(Request $request, $id)
    {
        $form = $this
            ->createForm(new GroupType(), $this->getGroup($id))
            ->submit($request);

        if ($form->isValid()) {
            $group = $form->getData();

            $this->getDoctrine()->getManager()->persist($group);
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
        /** @var Form $form */
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

    /**
     * @param $id
     * @return Form
     */
    private function createDeleteForm($id)
    {
        return $this
            ->createFormBuilder(array('id' => $id))
            ->add('id', 'hidden')
            ->add('submit', 'submit', array('label' => 'löschen'))
            ->getForm();
    }

    /**
     * @param null $repository
     * @return \Doctrine\Common\Persistence\ObjectRepository
     */
    private function getRepository($repository = null)
    {
        return $this
            ->getDoctrine()
            ->getManager()
            ->getRepository(is_null($repository) ? self::REPOSITORY : $repository);
    }

    /**
     * @param $id
     * @return mixed
     */
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
