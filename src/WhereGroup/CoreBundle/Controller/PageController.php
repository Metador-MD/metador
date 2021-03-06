<?php

namespace WhereGroup\CoreBundle\Controller;

use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use Exception;
use RuntimeException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use WhereGroup\CoreBundle\Entity\Page;
use WhereGroup\CoreBundle\Form\PageEditType;
use WhereGroup\CoreBundle\Form\PageType;

/**
 * Class PageController
 * @package WhereGroup\CoreBundle\Controller
 */
class PageController extends Controller
{
    /**
     * @return Response
     * @Route("/admin/page", name="metador_admin_page", methods={"GET"})
     */
    public function indexAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');
        $pages = [];

        foreach ($this->get('metador_configuration')->getAll('pages') as $config) {
            $pages[] = (new Page())->unserialize($config['value']);
        }

        return $this->render("@MetadorCore/Page/index.html.twig", [
            'pages' => $pages
        ]);
    }

    /**
     * @param Request $request
     * @param string $slug
     * @return Response
     * @throws NonUniqueResultException
     * @throws ORMException
     * @throws OptimisticLockException
     * @Route("/admin/page/new/{slug}", name="metador_admin_page_new", methods={ "GET", "POST" })
     */
    public function newAction(Request $request, $slug = "")
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $page = new Page();
        $page->setSlug($slug);

        $form = $this
            ->createForm(PageType::class, $page)
            ->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var Page $entity */
            $entity = $form->getData();
            $this->get('metador_configuration')->set($entity->getSlug(), $entity->serialize(), 'pages');
            return $this->redirectToRoute('metador_admin_page');
        }

        return $this->render('@MetadorCore/Page/new.html.twig', [
            'form' => $form->createView()
        ]);
    }

    /**
     * @param Request $request
     * @param $slug
     * @return Response
     * @throws NonUniqueResultException
     * @throws ORMException
     * @throws OptimisticLockException
     * @Route("/admin/page/edit/{slug}", name="metador_admin_page_edit", methods={ "GET", "POST" })
     */
    public function editAction(Request $request, $slug)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this
            ->createForm(PageEditType::class, $this->getEntity($slug))
            ->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var Page $entity */
            $entity = $form->getData();
            $this->get('metador_configuration')->set($entity->getSlug(), $entity->serialize(), 'pages');
            return $this->redirectToRoute('metador_admin_page');
        }

        return $this->render('@MetadorCore/Page/edit.html.twig', [
            'form' => $form->createView()
        ]);
    }

    /**
     * @param Request $request
     * @param $slug
     * @return RedirectResponse|Response
     * @Route("/admin/page/delete/{slug}", name="metador_admin_page_delete", methods={ "GET", "POST" })
     */
    public function deleteAction(Request $request, $slug)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $form = $this->createFormBuilder($this->getEntity($slug))
            ->add('delete', SubmitType::class, [
                'label' => 'l??schen'
            ])->getForm()->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->get('metador_configuration')->remove($slug, 'pages');
            return $this->redirectToRoute('metador_admin_page');
        }

        return $this->render('@MetadorCore/Page/delete.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/public/page/show/{slug}", name="metador_page_show", methods={ "GET" })
     * @param $slug
     * @return Response
     */
    public function showAction($slug)
    {
        try {
            $page = $this->getEntity($slug);
            if (!empty($page->getLink())) {
                return $this->redirect($page->getLink());
            }
        } catch (Exception $e) {
            $page = new Page();
        }
        return $this->render('@MetadorCore/Page/show.html.twig', [
            'page' => $page,
            'slug' => $slug
        ]);
    }

    /**
     * @param $slug
     * @return Page
     */
    private function getEntity($slug)
    {
        $data = $this->get('metador_configuration')->get($slug, 'pages');

        if (is_null($data)) {
            throw new RuntimeException("Slug nicht gefunden.");
        }

        return (new Page())->unserialize($data);
    }
}
