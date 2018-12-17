<?php

namespace WhereGroup\AddressBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use WhereGroup\AddressBundle\Entity\Address;
use WhereGroup\AddressBundle\Event\AddressChangeEvent;
use WhereGroup\AddressBundle\Form\AddressType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;

/**
 * @Route("/admin/address")
 */
class AddressController extends Controller
{
    /**
     * @Route("", name="metador_admin_address")
     * @Method("GET")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     * @throws \Doctrine\ORM\NoResultException
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function indexAction(Request $request)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        return $this->render('MetadorAddressBundle:Address:index.html.twig', $this->get('metador_address')->search(
            $request->get('terms', ''),
            $request->get('page', 1),
            $this
                ->get('metador_configuration')
                ->get('popup_search_hits', 'plugin', 'metador_core', 5)
        ));
    }

    /**
     * @Route("/new", name="metador_admin_address_new")
     * @Method({"GET", "POST"})
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function newAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this
            ->createForm(AddressType::class, new Address())
            ->handleRequest($this->get('request_stack')->getCurrentRequest())
        ;

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            try {
                $this->get('metador_address')->save($entity);
            } catch (MetadorException $e) {
                $this->setFlashWarning(
                    'create',
                    '',
                    $e->getMessage(),
                    array()
                );

                return $this->redirectToRoute('metador_admin_address');
            }

            $this->setFlashSuccess(
                'create',
                $entity->getId(),
                'Adresse %address% erfolgreich erstellt.',
                array('%address%' => $entity->getOrganisationName())
            );

            return $this->redirectToRoute('metador_admin_address');
        }

        return $this->render('MetadorAddressBundle:Address:new.html.twig', array(
            'form' => $form->createView()
        ));
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_address_edit")
     * @Method({"GET", "POST"})
     * @param $id
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function editAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this
            ->createForm(AddressType::class, $this->get('metador_address')->get($id))
            ->handleRequest($this->get('request_stack')->getCurrentRequest())
        ;

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();

            try {
                $this->get('metador_address')->save($entity);

                $this->setFlashSuccess(
                    'edit',
                    $id,
                    'Adresse %address% erfolgreich bearbeitet.',
                    array('%address%' => $entity->getOrganisationName())
                );
            } catch (MetadorException $e) {
                $this->setFlashWarning(
                    'edit',
                    $id,
                    'Adresse %address% existiert bereits.',
                    array('%address%' => $entity->getOrganisationName())
                );
            }

            return $this->redirectToRoute('metador_admin_address');
        }

        return $this->render('MetadorAddressBundle:Address:new.html.twig', array(
            'form' => $form->createView()
        ));
    }

    /**
     * @Route("/confirm/{id}", name="metador_admin_address_confirm")
     * @Method({"GET", "POST"})
     * @param $id
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function confirmAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this->createFormBuilder($this->get('metador_address')->get($id))
            ->add('delete', SubmitType::class, array(
                'label' => 'löschen'
            ))
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            $name   = $entity->getOrganisationName();
            $id     = $entity->getId();
            $event  = new AddressChangeEvent($entity, array());
            $this->get('event_dispatcher')->dispatch('address.pre_delete', $event);
            $this->get('metador_address')->remove($entity);

            $this->setFlashSuccess(
                'edit',
                $id,
                'Adresse %address% erfolgreich gelöscht.',
                array('%address%' => $name)
            );

            return $this->redirectToRoute('metador_admin_address');
        }

        return $this->render('MetadorAddressBundle:Address:confirm.html.twig', array(
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
            ->setSubcategory('address')
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
            ->setSubcategory('address')
            ->setOperation($operation)
            ->setIdentifier($id)
            ->setMessage($message)
            ->setMessageParameter($parameter)
            ->setUsername($this->get('metador_user')->getUsernameFromSession());

        $this->get('metador_logger')->set($log);

        unset($log);
    }
}
