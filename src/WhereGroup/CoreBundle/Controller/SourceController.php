<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\CoreBundle\Entity\Source;
use WhereGroup\CoreBundle\Event\SourceEvent;
use WhereGroup\CoreBundle\Form\SourceType;

/**
 * @Route("/admin/source")
 */
class SourceController extends Controller
{
    /**
     * @Route("/", name="metador_admin_source")
     * @Method("GET")
     */
    public function indexAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return $this->render('MetadorCoreBundle:Source:index.html.twig', array(
            'sources' => $this->get('metador_source')->all()
        ));
    }

    /**
     * @Route("/new/", name="metador_admin_source_new")
     * @Method({"GET", "POST"})
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function newAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $form = $this
            ->createForm(SourceType::class, new Source())
            ->handleRequest($this->get('request_stack')->getCurrentRequest())
        ;

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            if ($this->get('metador_source')->findBySlug($entity->getSlug())) {
                $this->setFlashWarning(
                    'edit',
                    '',
                    'Datenquelle existiert bereits.',
                    array()
                );

                return $this->redirectToRoute('metador_admin_source');
            }

            $this->get('metador_source')->save($entity);

            $this->setFlashSuccess(
                'edit',
                $entity->getId(),
                'Datenquelle %source% erfolgreich erstellt.',
                array('%source%' => $entity->getName())
            );

            return $this->redirectToRoute('metador_admin_source');
        }

        return $this->render('MetadorCoreBundle:Source:new.html.twig', array(
            'form' => $form->createView()
        ));
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_source_edit")
     * @Method({"GET", "POST"})
     * @param $id
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function editAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $form = $this
            ->createForm(SourceType::class, $this->get('metador_source')->get($id))
            ->handleRequest($this->get('request_stack')->getCurrentRequest())
        ;

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            $this->get('metador_source')->save($entity);

            $this->setFlashSuccess(
                'edit',
                $id,
                'Datenquelle %source% erfolgreich bearbeitet.',
                array('%source%' => $entity->getName())
            );

            return $this->redirectToRoute('metador_admin_source');
        }

        return $this->render('MetadorCoreBundle:Source:new.html.twig', array(
            'form' => $form->createView()
        ));
    }

    /**
     * @Route("/confirm/{id}", name="metador_admin_source_confirm")
     * @Method({"GET", "POST"})
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function confirmAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $form = $this->createFormBuilder($this->get('metador_source')->get($id))
            ->add('delete', SubmitType::class, array(
                'label' => 'löschen'
            ))
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        $event = new SourceEvent();
        $this->get('event_dispatcher')->dispatch('source.pre_delete', $event);


        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            $name   = $entity->getName();
            $id     = $entity->getId();

            $event = new SourceEvent($entity);
            $this->get('event_dispatcher')->dispatch('source.pre_delete', $event);

            $this->get('metador_source')->remove($entity);

            $this->get('event_dispatcher')->dispatch('source.post_delete', $event);

            $this->setFlashSuccess(
                'edit',
                $id,
                'Datenquelle %source% erfolgreich gelöscht.',
                array('%source%' => $name)
            );

            return $this->redirectToRoute('metador_admin_source');
        }

        $event = new SourceEvent($form->getData());
        $this->get('event_dispatcher')->dispatch('source.condirm_delete', $event);

        return $this->render('MetadorCoreBundle:Source:confirm.html.twig', array(
            'form' => $form->createView()
        ));
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
            ->setSubcategory('source')
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
            ->setSubcategory('source')
            ->setOperation($operation)
            ->setIdentifier($id)
            ->setMessage($message)
            ->setMessageParameter($parameter)
            ->setUsername($this->get('metador_user')->getUsernameFromSession());

        $this->get('metador_logger')->set($log);

        unset($log);
    }
}
