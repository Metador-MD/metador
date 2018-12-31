<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Controller;

use Plugins\WhereGroup\BasicProfileBundle\Entity\Keyword;
use Plugins\WhereGroup\BasicProfileBundle\Form\KeywordType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/admin/keyword")
 */
class KeywordController extends Controller
{
    /**
     * @Route("/", name="metador_admin_keyword", methods={"GET"})
     */
    public function indexAction()
    {
        return $this->render('@MetadorBasicProfile/Keyword/index.html.twig', [
            'keywords' => $this
                ->getDoctrine()
                ->getRepository('MetadorBasicProfileBundle:Keyword')
                ->findAll(),
        ]);
    }

    /**
     * @Route("/new/", name="metador_admin_keyword_new", methods={"GET", "POST"})
     */
    public function newAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this
            ->createForm(KeywordType::class, new Keyword())
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var Keyword $entity */
            $entity = $form->getData();
            $entity->setKeywords(array_combine($entity->getKeywords(), $entity->getKeywords()));

            $this->getDoctrine()->getManager()->persist($entity);
            $this->getDoctrine()->getManager()->flush();

            $this->setFlashSuccess('create', $entity->getId(), "Keyword erfolgreich erstellt.");

            return $this->redirectToRoute('metador_admin_keyword');
        }

        return $this->render('@MetadorBasicProfile/Keyword/new.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_keyword_edit", methods={"GET", "POST"})
     * @param $id
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     */
    public function editAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $entity = $this
            ->getDoctrine()
            ->getRepository('MetadorBasicProfileBundle:Keyword')
            ->findOneById($id);

        $form = $this
            ->createForm(KeywordType::class, $entity)
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            $entity->setKeywords(array_combine($entity->getKeywords(), $entity->getKeywords()));

            $this->getDoctrine()->getManager()->persist($entity);
            $this->getDoctrine()->getManager()->flush();

            $this->setFlashSuccess('update', $entity->getId(), "Keyword erfolgreich bearbeitet.");

            return $this->redirectToRoute('metador_admin_keyword');
        }

        return $this->render('@MetadorBasicProfile/Keyword/new.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/confirm/{id}", name="metador_admin_keyword_confirm", methods={"GET", "POST"})
     */
    public function confirmAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $entity = $this
            ->getDoctrine()
            ->getRepository('MetadorBasicProfileBundle:Keyword')
            ->findOneById($id);

        $form = $this->createFormBuilder($entity)
            ->add('delete', SubmitType::class, [
                'label' => 'löschen',
            ])
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            $this->getDoctrine()->getManager()->remove($entity);
            $this->getDoctrine()->getManager()->flush();

            $this->setFlashSuccess('delete', $entity->getId(), "Keyword erfolgreich gelöscht.");

            return $this->redirectToRoute('metador_admin_keyword');
        }

        return $this->render('@MetadorBasicProfile/Keyword/confirm.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    /**
     * @param $operation
     * @param $id
     * @param $message
     * @param array $parameter
     */
    private function setFlashWarning($operation, $id, $message, $parameter = [])
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
    private function setFlashSuccess($operation, $id, $message, $parameter = [])
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
