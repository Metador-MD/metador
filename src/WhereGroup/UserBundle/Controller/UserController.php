<?php

namespace WhereGroup\UserBundle\Controller;

use Exception;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use WhereGroup\PluginBundle\Component\ApplicationIntegration\Profile;
use WhereGroup\UserBundle\Entity\User;
use WhereGroup\UserBundle\Form\ProfileType;
use WhereGroup\UserBundle\Form\UserType;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;
use WhereGroup\CoreBundle\Component\PictureTransformation;

/**
 * User controller.
 *
 */
class UserController extends Controller
{
    /**
     *
     * @Route("/admin/user/", name="metador_admin_user")
     */
    public function indexAction()
    {
        return $this->render('@MetadorUser/User/index.html.twig', [
            'users' => $this->get('metador_user')->findAll(),
        ]);
    }

    /**
     * Displays a form to create a new User entity.
     *
     * @Route("/admin/user/new", name="metador_admin_user_new")
     */
    public function newAction()
    {
        return $this->render('@MetadorUser/User/new.html.twig', [
            'form' => $this
                ->createForm(UserType::class, new User())
                ->createView()
        ]);
    }

    /**
     *
     * @Route("/admin/user/create", name="metador_admin_user_create", methods={"POST"})
     * @param Request $request
     * @return RedirectResponse|Response
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

        return $this->render('@MetadorUser/User/new.html.twig', [
            'form'   => $form->createView(),
        ]);
    }

    /**
     *
     * @Route("/edit/{id}", name="metador_admin_user_edit")
     * @param $id
     * @return RedirectResponse|Response
     */
    public function editAction($id)
    {
        try {
            $user = $this->get('metador_user')->get($id);
        } catch (MetadorException $e) {
            $this->log('error', 'edit', $id, 'Benutzer konnte nicht bearbeitet werden.');
            return $this->redirectToRoute('metador_admin_user');
        }


        return $this->render('@MetadorUser/User/new.html.twig', [
            'form' => $this
                ->createForm(UserType::class, $user)
                ->createView()
        ]);
    }

    /**
     *
     * @Route("/admin/user/update/{id}", name="metador_admin_user_update", methods={"POST"})
     * @param Request $request
     * @param $id
     * @return RedirectResponse|Response
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

                $this->log('success', 'update', $id, 'Benutzer %username% wurde erfolgreich bearbeitet.', [
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

        return $this->render('@MetadorUser/User/new.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/admin/user/delete/{id}", name="metador_admin_user_confirm", methods={"GET", "POST"})
     * @param $id
     * @return RedirectResponse|Response
     * @throws MetadorException
     */
    public function confirmAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $form = $this->createFormBuilder($this->get('metador_user')->get($id))
            ->add('delete', SubmitType::class, [
                'label' => 'löschen'
            ])
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
            } catch (Exception $e) {
                $this->log('error', 'confirm', $id, 'Benutzer %username% konnte nicht gelöscht werden.', [
                    '%username%' => $name
                ]);
            }

            return $this->redirectToRoute('metador_admin_user');
        }

        return $this->render('@MetadorUser/User/confirm.html.twig', [
            'form' => $form->createView()
        ]);
    }

    /**
     * @Route("/user/profile/{id}", name="metador_user_profile", methods={"GET", "POST"})
     * @param $id
     * @param Request $request
     * @return RedirectResponse|Response
     */
    public function profileAction($id, Request $request)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_USER');


        try {
            $user = $this->get('metador_user')->get($id);
            $oldPassword = $user->getPassword();

            $form = $this
                ->createForm(ProfileType::class, $user)
                ->handleRequest($request);

            if ($form->isSubmitted() && $form->isValid()) {
                if ($user->getPassword() != "" && $oldPassword != $user->getPassword()) {
                    $user->setPassword(
                        $this->get('metador_user')->encodePassword($user, $user->getPassword())
                    );
                } else {
                    $user->setPassword($oldPassword);
                }

                $this->get('metador_user')->update($user);

                $this->log('success', 'update', $id, 'Kennwort für %username% wurde erfolgreich geändert.', [
                    '%username%' => $user->getUsername()
                ]);

                return $this->redirectToRoute('metador_home');
            }
        } catch (MetadorException $e) {
            $this->log('error', 'update', $id, 'Kennwort für %username% konnte nicht geändert werden.', [
                '%username%' => $user->getUsername()
            ]);

            return $this->redirectToRoute('metador_home');
        }

        return $this->render('@MetadorUser/User/profile.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    /**
     * @param $type
     * @param $operation
     * @param $id
     * @param $message
     * @param array $parameter
     */
    private function log($type, $operation, $id, $message, $parameter = [])
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
