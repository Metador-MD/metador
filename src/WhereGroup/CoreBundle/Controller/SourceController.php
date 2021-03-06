<?php

namespace WhereGroup\CoreBundle\Controller;

use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use WhereGroup\CoreBundle\Entity\Source;
use WhereGroup\CoreBundle\Event\SourceEvent;
use WhereGroup\CoreBundle\Form\SourceType;

/**
 * @Route("/admin/source")
 */
class SourceController extends Controller
{
    /**
     * @Route("/", name="metador_admin_source", methods={"GET"})
     */
    public function indexAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return $this->render('MetadorCoreBundle:Source:index.html.twig', [
            'sources' => $this->get('metador_source')->all()
        ]);
    }

    /**
     * @return RedirectResponse|Response
     * @throws ORMException
     * @throws OptimisticLockException
     * @Route("/new/", name="metador_admin_source_new", methods={"GET", "POST"})
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
                    []
                );

                return $this->redirectToRoute('metador_admin_source');
            }

            $this->get('metador_source')->save($entity);

            $this->setFlashSuccess(
                'edit',
                $entity->getId(),
                'Datenquelle %source% erfolgreich erstellt.',
                ['%source%' => $entity->getName()]
            );

            return $this->redirectToRoute('metador_admin_source');
        }

        return $this->render('MetadorCoreBundle:Source:new.html.twig', [
            'form' => $form->createView()
        ]);
    }

    /**
     * @param $id
     * @return RedirectResponse|Response
     * @throws ORMException
     * @throws OptimisticLockException
     * @Route("/edit/{id}", name="metador_admin_source_edit", methods={"GET", "POST"})
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
                ['%source%' => $entity->getName()]
            );

            return $this->redirectToRoute('metador_admin_source');
        }

        return $this->render('MetadorCoreBundle:Source:new.html.twig', [
            'form' => $form->createView()
        ]);
    }

    /**
     * @param $id
     * @return RedirectResponse|Response
     * @throws ORMException
     * @throws OptimisticLockException
     * @Route("/confirm/{id}", name="metador_admin_source_confirm", methods={"GET", "POST"})
     */
    public function confirmAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $form = $this->createFormBuilder($this->get('metador_source')->get($id))
            ->add('delete', SubmitType::class, [
                'label' => 'l??schen'
            ])
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        $event = new SourceEvent($form->getData()->getSlug());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            $name   = $entity->getName();
            $id     = $entity->getId();

            $this->get('event_dispatcher')->dispatch('source.pre_delete', $event);
            $this->get('metador_source')->remove($entity);
            $this->get('event_dispatcher')->dispatch('source.post_delete', $event);

            $this->setFlashSuccess(
                'edit',
                $id,
                'Datenquelle %source% erfolgreich gel??scht.',
                ['%source%' => $name]
            );

            return $this->redirectToRoute('metador_admin_source');
        }

        $this->get('event_dispatcher')->dispatch('source.confirm_delete', $event);

        return $this->render('MetadorCoreBundle:Source:confirm.html.twig', [
            'form'     => $form->createView(),
            'messages' => $event->getMessages()
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
    private function setFlashSuccess($operation, $id, $message, $parameter = [])
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
