<?php

namespace WhereGroup\UserBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

use WhereGroup\UserBundle\Entity\User;
use WhereGroup\UserBundle\Form\UserType;
use WhereGroup\CoreBundle\Component\MetadorException;

/**
 * User controller.
 *
 * @Route("/admin/user")
 */
class UserController extends Controller
{
    /**
     *
     * @Route("/", name="metador_admin_user")
     * @Template()
     */
    public function indexAction()
    {
        return array(
            'users' => $this->get('metador_user')->findAll(),
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
     * @Template("MetadorUserBundle:User:new.html.twig")
     */
    public function createAction(Request $request)
    {
        $user = new User();

        $form = $this
            ->createForm(new UserType(), $user)
            ->submit($request);

        if ($form->isValid()) {
            try {
                $this->get('metador_user')->insert($user);
                $this->get('metador_logger')->success(
                    'application',
                    'user',
                    'create',
                    'source',
                    'identifier',
                    'Benutzer %username% wurde erstellt.',
                    array('%username%' => $user->getUsername())
                );
            // todo eigene Exception
            } catch (MetadorException $e) {
                $this->get('metador_logger')->warning(
                    'application',
                    'user',
                    'create',
                    'source',
                    'identifier',
                    $e->getMessage()
                );
            }

            return $this->redirectToRoute('metador_admin_user');
        }

        return array(
            'form'   => $form->createView(),
        );
    }

    /**
     *
     * @Route("/edit/{id}", name="metador_admin_user_edit")
     * @Template("MetadorUserBundle:User:new.html.twig")
     */
    public function editAction($id)
    {
        try {
            $user = $this->get('metador_user')->get($id);
        } catch (MetadorException $e) {
            $this->get('metador_logger')->warning(
                'application',
                'user',
                'edit',
                'source',
                'identifier',
                $e->getMessage()
            );
            return $this->redirectToRoute('metador_admin_user');
        }

        return array(
            'form' => $this
                ->createForm(UserType::class, $user)
                ->createView(),
        );
    }

    /**
     *
     * @Route("/update/{id}", name="metador_admin_user_update")
     * @Method("POST")
     * @Template("MetadorUserBundle:User:new.html.twig")
     */
    public function updateAction(Request $request, $id)
    {
        try {
            $user = $this->get('metador_user')->get($id);

            $oldPassword = $user->getPassword();

            $form = $this
                ->createForm(new UserType(), $user)
                ->submit($request);

            if ($form->isValid()) {
                if ($user->getPassword() != "" && $oldPassword != $user->getPassword()) {
                    $user->setPassword(
                        $this->get('metador_user')->encodePassword($user, $user->getPassword())
                    );
                } else {
                    $user->setPassword($oldPassword);
                }

                $this->get('metador_user')->update($user);

                $this->get('metador_logger')->success(
                    'application',
                    'user',
                    'update',
                    'source',
                    'identifier',
                    'Benutzer %username% wurde bearbeitet.',
                    array('%username%' => $user->getUsername())
                );

                return $this->redirectToRoute('metador_admin_user');
            }
        } catch (MetadorException $e) {
            $this->get('metador_logger')->warning(
                'application',
                'user',
                'update',
                'source',
                'identifier',
                $e->getMessage()
            );
            return $this->redirectToRoute('metador_admin_user');
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
            try {
                $user = $this->get('metador_user')->get($id);
                $this->get('metador_user')->delete($user);
                $this->get('metador_logger')->success(
                    'application',
                    'user',
                    'delete',
                    'source',
                    'identifier',
                    'Benutzer %username% wurde gelöscht.',
                    array('%username%' => $user->getUsername())
                );
            } catch (MetadorException $e) {
                $this->get('metador_logger')->warning(
                    'application',
                    'user',
                    'delete',
                    'source',
                    'identifier',
                    $e->getMessage()
                );
                return $this->redirectToRoute('metador_admin_user');
            }
        }

        return $this->redirectToRoute('metador_admin_user');
    }

    private function createDeleteForm($id)
    {
        return $this
            ->createFormBuilder(array('id' => $id))
            ->add('id', 'hidden')
            ->add('submit', 'submit', array('label' => 'löschen'))
            ->getForm();
    }
}
