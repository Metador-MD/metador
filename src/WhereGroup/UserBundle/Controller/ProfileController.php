<?php

namespace WhereGroup\UserBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

use WhereGroup\UserBundle\Entity\User;
use WhereGroup\UserBundle\Entity\Group;
use WhereGroup\UserBundle\Form\ProfileType;
use WhereGroup\CoreBundle\Component\MetadorException;

/**
 *
 * @Route("/profile")
 */
class ProfileController extends Controller
{
    /**
     * @Route("/", name="metador_profile_index")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        $user = $this->get('metador_user')->getUserFromSession();

        return array(
            'form' => $this
                ->createForm(new ProfileType, $user)
                ->createView(),
            'user' => $user
        );
    }

    /**
     * @Route("/update/{id}", name="metador_profile_update")
     * @Method("POST")
     * @Template("WhereGroupUserBundle:Profile:index.html.twig")
     */
    public function updateAction(Request $request, $id)
    {
        try {
            $user = $this->get('metador_user')->get($id);

            $oldPassword = $user->getPassword();

            $form = $this
                ->createForm(new ProfileType(), $user)
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
                    'Benutzer %username% wurde bearbeitet.',
                    array('%username%' => $user->getUsername())
                );

                return $this->redirectToRoute('metador_dashboard');
            }

        } catch (MetadorException $e) {
            $this->get('metador_logger')->warning($e->getMessage());
            return $this->redirectToRoute('metador_dashboard');
        }

        return array(
            'form' => $form->createView(),
        );
    }
}
