<?php

namespace WhereGroup\UserBundle\Controller;

use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use WhereGroup\UserBundle\Entity\User;
use WhereGroup\UserBundle\Form\UserType;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;
use WhereGroup\CoreBundle\Component\PictureTransformation;

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
     */
    public function indexAction()
    {
        return $this->render('@MetadorUser/User/index.html.twig', array(
            'users' => $this->get('metador_user')->findAll(),
        ));
    }

    /**
     * Displays a form to create a new User entity.
     *
     * @Route("/new", name="metador_admin_user_new")
     */
    public function newAction()
    {
        return $this->render('@MetadorUser/User/new.html.twig', array(
            'form' => $this
                ->createForm(UserType::class, new User())
                ->createView()
        ));
    }

    /**
     *
     * @Route("/create", name="metador_admin_user_create")
     * @Method("POST")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     */
    public function createAction(Request $request)
    {
        $user = new User();

        $form = $this
            ->createForm(UserType::class, $user)
            ->handleRequest($request);

        if ($user->getPicture() !== null) {
            $picture = new PictureTransformation($user->getPicture());
            $picture->resizeProfilePicture(60, 60);
            $user->setPicture($picture->getImageBase64Encode());
        }

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $this->get('metador_user')->insert($user);
                $this->log('success', 'edit', $user->getId(), 'Benutzer %username% wurde erfolgreich erstellt.', [
                    '%username%' => $user->getUsername()
                ]);
            } catch (MetadorException $e) {
                $this->log('error', 'edit', $user->getId(), 'Benutzer %username% konnte nicht erstellt werden.', [
                    '%username%' => $user->getUsername()
                ]);
            }

            return $this->redirectToRoute('metador_admin_user');
        }

        return $this->render('@MetadorUser/User/new.html.twig', array(
            'form'   => $form->createView(),
        ));
    }

    /**
     *
     * @Route("/edit/{id}", name="metador_admin_user_edit")
     */
    public function editAction($id)
    {
        try {
            $user = $this->get('metador_user')->get($id);
            $this->log('success', 'edit', $id, 'Benutzer %username% wurde erfolgreich bearbeitet.', [
                '%username%' => $user->getUsername()
            ]);
        } catch (MetadorException $e) {
            $this->log('error', 'edit', $id, 'Benutzer %username% konnte nicht bearbeitet werden.', [
                '%username%' => $user->getUsername()
            ]);

            return $this->redirectToRoute('metador_admin_user');
        };

        return $this->render('@MetadorUser/User/new.html.twig', array(
            'form' => $this
                ->createForm(UserType::class, $user)
                ->createView()
        ));
    }

    /**
     *
     * @Route("/update/{id}", name="metador_admin_user_update")
     * @Method("POST")
     * @param Request $request
     * @param $id
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     */
    public function updateAction(Request $request, $id)
    {
        try {
            $user = $this->get('metador_user')->get($id);

            $oldPassword = $user->getPassword();
            $oldPicture = $user->getPicture();

            $form = $this
                ->createForm(UserType::class, $user)
                ->handleRequest($request);

            if ($form->isSubmitted() && $form->isValid()) {
                if ($user->getPassword() != "" && $oldPassword != $user->getPassword()) {
                    $user->setPassword(
                        $this->get('metador_user')->encodePassword($user, $user->getPassword())
                    );
                } else {
                    $user->setPassword($oldPassword);
                }

                if (!empty($user->getPicture()) &&  $oldPicture !== $user->getPicture()) {
                    $picture = new PictureTransformation($user->getPicture());
                    $picture->resizeProfilePicture(60, 60);
                    $user->setPicture($picture->getImageBase64Encode());
                } else {
                    $user->setPicture($oldPicture);
                }

                $this->get('metador_user')->update($user);

                $this->log('success', 'update', $id, 'Benutzer %username% wurde erstellt.', [
                    '%username%' => $user->getUsername()
                ]);

                return $this->redirectToRoute('metador_admin_user');
            }
        } catch (MetadorException $e) {
            $this->log('error', 'update', $id, 'Benutzer %username% konnte nicht erstellt werden.', [
                '%username%' => $user->getUsername()
            ]);

            return $this->redirectToRoute('metador_admin_user');
        }

        return $this->render('@MetadorUser/User/new.html.twig', array(
            'form' => $form->createView(),
        ));
    }

    /**
     * @Method({"GET", "POST"})
     * @Route("/delete/{id}", name="metador_admin_user_confirm")
     */
    public function confirmAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $form = $this->createFormBuilder($this->get('metador_user')->get($id))
            ->add('delete', SubmitType::class, array(
                'label' => 'löschen'
            ))
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $entity = $form->getData();
                $name   = $entity->getUsername();
                $id     = $entity->getId();

                $this->get('metador_user')->delete($entity);
                $this->log('success', 'confirm', $id, 'Benutzer %username% erfolgreich gelöscht.', [
                    '%username%' => $name
                ]);
            } catch (\Exception $e) {
                $this->log('error', 'confirm', $id, 'Benutzer %username% konnte nicht gelöscht werden.', [
                    '%username%' => $name
                ]);
            }

            return $this->redirectToRoute('metador_admin_user');
        }

        return $this->render('@MetadorUser/User/confirm.html.twig', array(
            'form' => $form->createView()
        ));
    }

    /**
     * @param $operation
     * @param $id
     * @param $message
     * @param array $parameter
     */
    private function log($type, $operation, $id, $message, $parameter = array())
    {
        $log = $this->get('metador_logger')->newLog();

        $log->setType($type)
            ->setMessage($message, $parameter)
            ->setFlashMessage()
            ->setCategory('application')
            ->setSubcategory('user')
            ->setOperation($operation)
            ->setIdentifier($id);

        if (!empty($id)) {
            $log->setPath('metador_admin_user_edit', ['id' => $id]);
        }

        $this->get('metador_logger')->set($log);

        unset($log);
    }
}
