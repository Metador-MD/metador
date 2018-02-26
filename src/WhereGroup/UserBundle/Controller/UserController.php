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

        $log = $this->get('metador_logger')->newLog();

        $log->setCategory('application')
            ->setSubcategory('user')
            ->setOperation('create')
            ->setIdentifier($user->getId())
            ->setUsername($this->get('metador_user')->getUsernameFromSession())
            ->setPath('metador_admin_user_edit')
            ->setParams(array('id' => $user->getId()))
            ->setMessageParameter(array('%username%' => $user->getUsername()));

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

                $log->setType('success')
                    ->setMessage('Benutzer %username% wurde erstellt.');

            // todo eigene Exception
            } catch (MetadorException $e) {
                $log->setType('error')
                    ->setMessage('Benutzer %username% konnte nicht erstellt werden.');
            }

            $this->get('metador_logger')->set($log);
            unset($log);

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
            $this->log('success', 'edit', $id, 'Benutzer '.$user->getUsername().' wurde erstellt.');
        } catch (MetadorException $e) {
            $this->log('error', 'edit', $id, 'Benutzer '.$user->getUsername().' konnte nicht erstellt werden.');

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
                $this->log('success', 'update', $id, 'Benutzer '.$user->getUsername().' wurde erstellt.');

                return $this->redirectToRoute('metador_admin_user');
            }
        } catch (MetadorException $e) {
            $this->log('error', 'update', $id, 'Benutzer '.$user->getUsername().' konnte nicht erstellt werden.');

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
                $this->log('success', 'confirm', $id, 'Benutzer '.$name.' erfolgreich gelöscht.');
            } catch (\Exception $e) {
                $this->log('error', 'confirm', $id, 'Benutzer '.$name.' konnte nicht gelöscht werden.');
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
            ->setPath('metador_admin_user_edit')
            ->setFlashMessage()
            ->setCategory('application')
            ->setSubcategory('user')
            ->setOperation($operation)
            ->setIdentifier($id);

        $this->get('metador_logger')->set($log);

        unset($log);
    }
}
