<?php

namespace WhereGroup\UserBundle\Controller;

use JMS\SecurityExtraBundle\Annotation\Secure;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\SecurityContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use WhereGroup\CoreBundle\Entity\Log;
use Wheregroup\UserBundle\Entity\User;

class SecurityController extends Controller
{
    /**
     *
     * @Route("/login/failure", name="login_failure")
     * @Method("GET")
     * @Template("MetadorThemeBundle:Home:index.html.twig")
     */
    public function loginAction()
    {
        $authenticationUtils = $this->get('security.authentication_utils');

        /** @var Log $log */
        $log = $this->get('metador_logger')->newLog();

        $log->setType('warning')
            ->setCategory('application')
            ->setSubcategory('user')
            ->setOperation('login')
            ->setMessage('login_failure')
            ->setFlashMessage()
            ->setUsername($authenticationUtils->getLastUsername());

        $this->get('metador_logger')->set($log);

        unset($log);

        return $this->redirectToRoute('metador_home');
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
