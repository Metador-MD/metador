<?php

namespace WhereGroup\CoreBundle\Controller;

use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use WhereGroup\CoreBundle\Entity\Source;
use WhereGroup\CoreBundle\Form\SourceType;

/**
 * @Route("/admin/source")
 */
class SourceController extends Controller
{
    /**
     * @Route("/", name="metador_admin_source")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return array(
            'sources' => $this->get('metador_source')->all()
        );
    }

    /**
     * @Route("/new/", name="metador_admin_source_new")
     * @Method({"GET", "POST"})
     * @Template()
     */
    public function newAction()
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

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

        return array(
            'form' => $form->createView()
        );
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_source_edit")
     * @Method({"GET", "POST"})
     * @Template("MetadorCoreBundle:Source:new.html.twig")
     * @param $id
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function editAction($id)
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

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

        return array(
            'form' => $form->createView()
        );
    }

    /**
     * @Route("/confirm/{id}", name="metador_admin_source_confirm")
     * @Method({"GET", "POST"})
     * @Template()
     */
    public function confirmAction($id)
    {
        $this->get('metador_core')->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $form = $this->createFormBuilder($this->get('metador_source')->get($id))
            ->add('delete', 'submit', array(
                'label' => 'löschen'
            ))
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            $name   = $entity->getName();
            $id     = $entity->getId();

            $this->get('metador_source')->remove($entity);

            $this->setFlashSuccess(
                'edit',
                $id,
                'Datenquelle %source% erfolgreich gelöscht.',
                array('%source%' => $name)
            );

            return $this->redirectToRoute('metador_admin_source');
        }

        return array(
            'form' => $form->createView()
        );
    }

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
