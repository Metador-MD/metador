<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/admin/lists")
 */
class ListsController extends Controller
{
    /**
     * @Method("GET")
     * @Route("/", name="metador_admin_lists")
     */
    public function indexAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $lists = [];

        foreach ($this->get('metador_plugin')->getActiveProfiles() as $profileKey => $profile) {
            $lists[$profileKey] = $this->get('metador_configuration')->getAll('list-option', $profileKey);
        }

        return $this->render('@MetadorBasicProfile/Lists/index.html.twig', array(
            'lists' => $lists
        ));
    }

    /**
     * @Method("GET")
     * @Route("/show/{profile}/{key}/", name="metador_admin_lists_show")
     * @param $profile
     * @param $key
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function showAction($profile, $key)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        return $this->render('@MetadorBasicProfile/Lists/show.html.twig', array(
            'listProfile'  => $profile,
            'listKey'      => $key,
            'list'         => $this->get('metador_configuration')->get($key, 'list-option', $profile)
        ));
    }

    /**
     * @Method({"GET", "POST"})
     * @Route("/new/{profile}/{key}/", name="metador_admin_lists_new")
     * @param $profile
     * @param $key
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     * @throws \Doctrine\ORM\NonUniqueResultException
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function newAction($profile, $key)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $request = $this->get('request_stack')->getCurrentRequest();

        if ($request->getMethod() === 'POST'
            && !is_null($request->request->get('key', null))
            && !is_null($request->request->get('value', null))) {
            $value = $this->get('metador_configuration')->get($key, 'list-option', $profile, []);

            if ($request->request->get('prev_key') !== $request->request->get('key')
                && $request->request->get('prev_key') !== null) {
                unset($value[$request->request->get('prev_key')]);
            }

            $value[$request->request->get('key')] = $request->request->get('value');

            $this->get('metador_configuration')->set($key, $value, 'list-option', $profile);

            return $this->redirectToRoute('metador_admin_lists_show', ['profile' => $profile, 'key' => $key]);
        }

        return $this->render('@MetadorBasicProfile/Lists/new.html.twig', array(
            'listProfile'  => $profile,
            'listKey'      => $key,
            'listTemplate' => $this->get('metador_configuration')->get($key, 'list-option-template', $profile),
        ));
    }

    /**
     * @Method({"GET", "POST"})
     * @Route("/confirm/element/{profile}/{key}/{elementKey}", name="metador_admin_lists_confirm_element", defaults={
     *     "elementKey"=""
     * })
     * @param $profile
     * @param $key
     * @param $elementKey
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     * @throws \Doctrine\ORM\NonUniqueResultException
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function confirmElementAction($profile, $key, $elementKey)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $request = $this->get('request_stack')->getCurrentRequest();

        if ($request->getMethod() === 'POST') {
            $value = $this->get('metador_configuration')->get($key, 'list-option', $profile, []);

            $pointer = 0;

            foreach ($value as $listKey => $listValue) {
                if ($pointer === (int)$elementKey) {
                    $elementKey = $listKey;
                    break;
                }

                ++$pointer;
            }

            unset($value[$elementKey]);
            $this->get('metador_configuration')->set($key, $value, 'list-option', $profile);

            return $this->redirectToRoute('metador_admin_lists_show', ['profile' => $profile, 'key' => $key]);
        }

        return $this->render('@MetadorBasicProfile/Lists/confirmElement.html.twig', array(
            'listProfile'    => $profile,
            'listKey'        => $key,
            'listElementKey' => $elementKey
        ));
    }

    /**
     * @Method("GET")
     * @Route("/edit/element/{profile}/{key}/{elementKey}", name="metador_admin_lists_edit_element", defaults={
     *     "elementKey"=""
     * })
     * @param $profile
     * @param $key
     * @param $elementKey
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editElementAction($profile, $key, $elementKey)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $value = $this->get('metador_configuration')->get($key, 'list-option', $profile, []);

        $pointer = 0;

        foreach ($value as $listKey => $listValue) {
            if ($pointer === (int)$elementKey) {
                $elementKey = $listKey;
                break;
            }

            ++$pointer;
        }

        return $this->render('@MetadorBasicProfile/Lists/editElement.html.twig', array(
            'listProfile'    => $profile,
            'listKey'        => $key,
            'key'            => $elementKey,
            'value'          => $value[$elementKey]
        ));
    }

    /**
     * @Method({"GET", "POST"})
     * @Route("/confirm/{profile}/{key}/", name="metador_admin_lists_confirm")
     * @param $profile
     * @param $key
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     */
    public function confirmAction($profile, $key)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_GEO_OFFICE');

        $request = $this->get('request_stack')->getCurrentRequest();

        if ($request->getMethod() === 'POST') {
            $this->get('metador_configuration')->remove($key, 'list-option', $profile);

            return $this->redirectToRoute('metador_admin_lists');
        }

        return $this->render('@MetadorBasicProfile/Lists/confirm.html.twig', array(
            'listProfile'    => $profile,
            'listKey'        => $key
        ));
    }
}
