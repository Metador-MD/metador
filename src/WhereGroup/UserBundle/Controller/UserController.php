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

    const REPOSITORY = 'WhereGroupUserBundle:User';

    /**
     *
     * @Route("/", name="metador_admin_user")
     * @Template()
     */
    public function indexAction()
    {
        return array(
            'users' => $this
                ->getRepository()
                ->findAllSorted(),
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
        return array(
            'form' => $this
                ->createForm(new UserType(), new User())
                ->createView()
        );
    }

    /**
     *
     * @Route("/create", name="metador_admin_user_create")
     * @Method("POST")
     * @Template("WhereGroupUserBundle:User:new.html.twig")
     */
    public function createAction(Request $request)
    {
        $user  = new User();

        $form = $this
            ->createForm(new UserType(), $user)
            ->submit($request);

        if ($form->isValid()) {
            // TODO: user exists?
            $encoder = $this->container->get('security.encoder_factory')->getEncoder($user);
            $user->setPassword(
                $encoder->encodePassword($user->getPassword(), $user->getSalt())
            );

            $this->get('metador_logger')->success('Benutzer ' . $user->getUsername() . ' wurde erstellt.');

            return $this
                ->save($user)
                ->redirect($this->generateUrl('metador_admin_user'));
        }

        return array(
            'form'   => $form->createView(),
        );
    }

    /**
     *
     * @Route("/edit/{id}", name="metador_admin_user_edit")
     * @Template("WhereGroupUserBundle:User:new.html.twig")
     */
    public function editAction($id)
    {
        $user = $this
            ->getRepository()
            ->findOneById($id);

        if (!$user) {
            throw $this->createNotFoundException('Benutzer konnte nicht gefunden werden');
        }

        return array(
            'form' => $this
                ->createForm(new UserType(), $user)
                ->createView(),
        );
    }

    /**
     *
     * @Route("/update/{id}", name="metador_admin_user_update")
     * @Method("POST")
     * @Template("WhereGroupUserBundle:User:new.html.twig")
     */
    public function updateAction(Request $request, $id)
    {
        $user = $this->getRepository()->findOneById($id);

        if (!$user) {
            throw $this->createNotFoundException('Benutzer konnte nicht gefunden werden');
        }

        $oldPassword = $user->getPassword();

        $this->get('logger')->info($oldPassword);

        $form = $this
            ->createForm(new UserType(), $user)
            ->submit($request);

        if ($form->isValid()) {
            $encoder = $this->container->get('security.encoder_factory')->getEncoder($user);

            if ($user->getPassword() != "" && $oldPassword != $user->getPassword()) {
                $user->setPassword(
                    $encoder->encodePassword($user->getPassword(), $user->getSalt())
                );
            } else {
                $user->setPassword($oldPassword);
            }

            $this->get('metador_logger')->success(
                'Benutzer %username% wurde bearbeitet.',
                array('%username%' => $user->getUsername())
            );

            return $this
                ->save($user)
                ->redirect($this->generateUrl('metador_admin_user'));
        }

        return array(
            'form' => $form->createView(),
        );
    }

    /**
     * @Method("GET")
     * @Route("/delete/{id}", name="metador_admin_user_confirm")
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
     * @Route("/delete/{id}", name="metador_admin_user_delete")
     * @Method("POST")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this
            ->createDeleteForm($id)
            ->submit($request);

        if ($form->isValid()) {
            $user = $this->getRepository()->findOneById($id);

            if (!$user) {
                throw $this->createNotFoundException('Benutzer konnte nicht gefunden werden');
            }

            $this
                ->remove($user)
                ->addFlash('success', 'Benutzer erfolgreich gelöscht.');
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

    private function save($entity)
    {
        $em = $this->getDoctrine()->getManager();
        $em->persist($entity);
        $em->flush();

        return $this;
    }

    private function remove($entity)
    {
        $this->get('metador_logger')->success('Benutzer erfolgreich gelöscht.');

        $em = $this->getDoctrine()->getManager();
        $em->remove($entity);
        $em->flush();

        return $this;
    }
}
