<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Controller;

use Plugins\WhereGroup\BasicProfileBundle\Entity\Keyword;
use Plugins\WhereGroup\BasicProfileBundle\Form\KeywordType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 * @Route("/admin/keyword")
 */
class KeywordController extends Controller
{
    /**
     * @Method("GET")
     * @Route("/", name="metador_admin_keyword")
     * @Template()
     */
    public function indexAction()
    {
        return array(
            'keywords' => $this
                ->getDoctrine()
                ->getRepository('MetadorBasicProfileBundle:Keyword')
                ->findAll()
        );
    }

    /**
     * @Route("/new/", name="metador_admin_keyword_new")
     * @Method({"GET", "POST"})
     * @Template()
     */
    public function newAction()
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this
            ->createForm(KeywordType::class, new Keyword())
            ->handleRequest($this->get('request_stack')->getCurrentRequest())
        ;

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            $this->getDoctrine()->getManager()->persist($entity);
            $this->getDoctrine()->getManager()->flush($entity);

            return $this->redirectToRoute('metador_admin_keyword');
        }

        return array(
            'form' => $form->createView()
        );

    }

    /**
     * @Route("/edit/{id}", name="metador_admin_keyword_edit")
     * @Method({"GET", "POST"})
     * @Template("@MetadorBasicProfile/Keyword/new.html.twig")
     * @param $id
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function editAction($id)
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $entity = $this
            ->getDoctrine()
            ->getRepository('MetadorBasicProfileBundle:Keyword')
            ->findOneById($id);


        $form = $this
            ->createForm(KeywordType::class, $entity)
            ->handleRequest($this->get('request_stack')->getCurrentRequest())
        ;

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            $this->getDoctrine()->getManager()->persist($entity);
            $this->getDoctrine()->getManager()->flush($entity);

            return $this->redirectToRoute('metador_admin_keyword');
        }

        return array(
            'form' => $form->createView()
        );
    }

    /**
     * @Route("/confirm/{id}", name="metador_admin_keyword_confirm")
     * @Method({"GET", "POST"})
     * @Template()
     */
    public function confirmAction($id)
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $entity = $this
            ->getDoctrine()
            ->getRepository('MetadorBasicProfileBundle:Keyword')
            ->findOneById($id);

        $form = $this->createFormBuilder($entity)
            ->add('delete', 'submit', array(
                'label' => 'löschen'
            ))
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            $this->getDoctrine()->getManager()->remove($entity);
            $this->getDoctrine()->getManager()->flush($entity);

            return $this->redirectToRoute('metador_admin_keyword');
        }

        return array(
            'form' => $form->createView()
        );
    }

    /**
     * @param $operation
     * @param $id
     * @param $message
     * @param array $parameter
     */
    private function setFlashWarning($operation, $id, $message, $parameter = array())
    {
        $log = $this->get('metador_logger')->newLog();

        $log->setType('warning')
            ->setFlashMessage()
            ->setCategory('application')
            ->setSubcategory('keyword')
            ->setOperation($operation)
            ->setIdentifier($id)
            ->setMessage($message)
            ->setMessageParameter($parameter)
            ->setUsername($this->get('metador_user')->getUsernameFromSession());

        $this->get('metador_logger')->set($log);

        unset($log);
    }

    /**
     * @param $operation
     * @param $id
     * @param $message
     * @param array $parameter
     */
    private function setFlashSuccess($operation, $id, $message, $parameter = array())
    {
        $log = $this->get('metador_logger')->newLog();

        $log->setType('success')
            ->setFlashMessage()
            ->setCategory('application')
            ->setSubcategory('keyword')
            ->setOperation($operation)
            ->setIdentifier($id)
            ->setMessage($message)
            ->setMessageParameter($parameter)
            ->setUsername($this->get('metador_user')->getUsernameFromSession());

        $this->get('metador_logger')->set($log);

        unset($log);
    }
}
