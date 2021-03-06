<?php

namespace WhereGroup\UserBundle\Controller;

use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use WhereGroup\UserBundle\Entity\Group;
use WhereGroup\UserBundle\Form\GroupType;

/**
 * Group controller.
 *
 * @Route("/admin/group")
 */
class GroupController extends Controller
{
    const REPOSITORY = 'MetadorUserBundle:Group';

    /**
     * @Route("/", name="metador_admin_group")
     */
    public function indexAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return $this->render('@MetadorUser/Group/index.html.twig', [
            'groups' => $this->getRepository()->findAllSorted()
        ]);
    }

    /**
     *
     * @Route("/new/", name="metador_admin_group_new", methods={"GET"})
     */
    public function newAction()
    {
        return $this->render('@MetadorUser/Group/new.html.twig', [
            'form' => $this
                ->createForm(GroupType::class, new Group())
                ->createView(),
            'users' => $this
                ->getRepository('MetadorUserBundle:User')
                ->findAll()
        ]);
    }

    /**
     * @Route("/create", name="metador_admin_group_create", methods={"POST"})
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function createAction(Request $request)
    {
        $entity  = new Group();
        $form = $this->createForm(GroupType::class, $entity)->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $roleExists = $this
                ->getRepository()
                ->findOneBy(['role' => $entity->getRole()]);

            if (!$roleExists) {
                $em->persist($entity);
                $em->flush();
                $this->log('success', 'create', $entity->getId(), 'Gruppe erfolgreich hinzugef??gt.');
            } else {
                $this->log('warning', 'create', $entity->getId(), 'Gruppe existiert bereits.');
            }
        }

        return $this->redirect($this->generateUrl('metador_admin_group'));
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_group_edit", methods={"GET"})
     * @param $id
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editAction($id)
    {
        return $this->render('MetadorUserBundle:Group:new.html.twig', [
            'form' => $this
                ->createForm(GroupType::class, $this->getGroup($id))
                ->createView(),
            'users' => $this
                ->getRepository('MetadorUserBundle:User')
                ->findAll()
        ]);
    }

    /**
     * @Route("/edit/{id}", name="metador_admin_group_update", methods={"POST"})
     * @param Request $request
     * @param $id
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     */
    public function updateAction(Request $request, $id)
    {
        $form = $this
            ->createForm(GroupType::class, $this->getGroup($id))->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $group = $form->getData();

            $this->getDoctrine()->getManager()->persist($group);
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('metador_admin_group');
        }

        return $this->render('MetadorUserBundle:Group:new.html.twig', ['form' => $form]);
    }

    /**
     * @Route("/delete/{id}", name="metador_admin_group_confirm", methods={"GET", "POST"})
     * @param $id
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     */
    public function confirmAction($id)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $form = $this->createFormBuilder($this->getRepository()->findOneById($id))
            ->add('delete', SubmitType::class, [
                'label' => 'l??schen'
            ])
            ->getForm()
            ->handleRequest($this->get('request_stack')->getCurrentRequest());

        if ($form->isSubmitted() && $form->isValid()) {
            $entity = $form->getData();
            $name   = $entity->getRole();
            $id     = $entity->getId();

            $em = $this->getDoctrine()->getManager();
            $em->remove($entity);
            $em->flush();

            $this->log(
                'success',
                'delete',
                $id,
                'Gruppe %group% erfolgreich gel??scht.',
                ['%group%' => $name]
            );

            return $this->redirectToRoute('metador_admin_group');
        }

        return $this->render('MetadorUserBundle:Group:confirm.html.twig', [
            'form' => $form->createView()
        ]);
    }

    /**
     * @param null $repository
     * @return \Doctrine\Common\Persistence\ObjectRepository
     */
    private function getRepository($repository = null)
    {
        return $this
            ->getDoctrine()
            ->getManager()
            ->getRepository(is_null($repository) ? self::REPOSITORY : $repository);
    }

    /**
     * @param $id
     * @return mixed
     */
    private function getGroup($id)
    {
        $entity = $this->getRepository()->findOneById($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Group entity.');
        }

        return $entity;
    }

    /**
     * @param $type
     * @param $operation
     * @param $id
     * @param $message
     * @param array $parameter
     */
    private function log($type, $operation, $id, $message, $parameter = [])
    {
        $log = $this->get('metador_logger')->newLog();

        $log->setType($type)
            ->setFlashMessage()
            ->setCategory('application')
            ->setSubcategory('group')
            ->setOperation($operation)
            ->setIdentifier($id)
            ->setMessage($message, $parameter);

        $this->get('metador_logger')->set($log);

        unset($log);
    }
}
