<?php

namespace WhereGroup\UserBundle\Controller;

use JMS\SecurityExtraBundle\Annotation\Secure;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\SecurityContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Wheregroup\UserBundle\Entity\User;

class SecurityController extends Controller
{
    /**
     *
     * @Route("/login/failure", name="login_failure")
     * @Method("GET")
     * @Template("MetadorThemeBundle:Profile:index.html.twig")
     */
    public function loginAction()
    {
        $authenticationUtils = $this->get('security.authentication_utils');

        return array(
            // last username entered by the user
            'last_username' => $authenticationUtils->getLastUsername(),
            // get the login error if there is one
            'error'         => $authenticationUtils->getLastAuthenticationError()
        );
    }

    /**
     *
     * @Route("/login/check", name="login_check")
     */
    public function loginCheckAction()
    {
    }

    /**
     *
     * @Route("/logout", name="logout")
     */
    public function logoutAction()
    {
    }
}
