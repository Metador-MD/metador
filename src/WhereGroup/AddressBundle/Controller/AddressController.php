<?php

namespace WhereGroup\AddressBundle\Controller;

use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use WhereGroup\AddressBundle\Entity\Address;
use WhereGroup\AddressBundle\Event\AddressChangeEvent;
use WhereGroup\AddressBundle\Form\AddressType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;

/**
 * @Route("/admin/address")
 */
class AddressController extends Controller
{
    /**
     * @param Request $request
     * @return Response
     * @throws NonUniqueResultException
     * @Route("", name="metador_admin_address", methods={"GET"})
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
     * @return RedirectResponse|Response
     * @Route("/new", name="metador_admin_address_new", methods={"GET", "POST"})
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
                    []
                );

                return $this->redirectToRoute('metador_admin_address');
            }

            $this->setFlashSuccess(
                'create',
                $entity->getId(),
                'Adresse %address% erfolgreich erstellt.',
                ['%address%' => $entity->getOrganisationName()]
            );

            return $this->redirectToRoute('metador_admin_address');
        }

        return $this->render('MetadorAddressBundle:Address:new.html.twig', [
            'form' => $form->createView()
        ]);
    }

    /**
     * @param $id
     * @return RedirectResponse|Response
     * @Route("/edit/{id}", name="metador_admin_address_edit", methods={"GET", "POST"})
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
                    ['%address%' => $entity->getOrganisationName()]
                );
            } catch (MetadorException $e) {
                $this->setFlashWarning(
                    'edit',
                    $id,
                    'Adresse %address% existiert bereits.',
                    ['%address%' => $entity->getOrganisationName()]
                );
            }

            return $this->redirectToRoute('metador_admin_address');
        }

        return $this->render('MetadorAddressBundle:Address:new.html.twig', [
            'form' => $form->createView()
        ]);
    }

    /**
     * @param $id
     * @return RedirectResponse|Response
     * @throws ORMException
     * @throws OptimisticLockException
     * @Route("/confirm/{id}", name="metador_admin_address_confirm", methods={"GET", "POST"})
     */
    public function confirmAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this->createFormBuilder($this->get('metador_address')->get($id))
            ->add('delete', SubmitType::class, [
                'label' => 'löschen'
            ])
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            $name   = $entity->getOrganisationName();
            $id     = $entity->getId();
            $event  = new AddressChangeEvent($entity, []);
            $this->get('event_dispatcher')->dispatch('address.pre_delete', $event);
            $this->get('metador_address')->remove($entity);

            $this->setFlashSuccess(
                'edit',
                $id,
                'Adresse %address% erfolgreich gelöscht.',
                ['%address%' => $name]
            );

            return $this->redirectToRoute('metador_admin_address');
        }

        return $this->render('MetadorAddressBundle:Address:confirm.html.twig', [
            'form' => $form->createView()
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
    private function setFlashSuccess($operation, $id, $message, $parameter = [])
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
