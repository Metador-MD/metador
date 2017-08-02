<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 * @Route("/admin/lists")
 */
class ListsController extends Controller
{
    /**
     * @Method("GET")
     * @Route("/", name="metador_admin_lists")
     * @Template()
     */
    public function indexAction()
    {
        $lists = array();

        foreach ($this->get('metador_plugin')->getActiveProfiles() as $profileKey => $profile) {
            $lists[$profileKey] = $this->get('metador_configuration')->getAll('list-option', $profileKey);
        }

        return array(
            'lists' => $lists
        );
    }

    /**
     * @Method("GET")
     * @Route("/edit/{profile}/{key}/", name="metador_admin_lists_edit")
     * @Template()
     * @param $profile
     * @param $key
     * @return array
     */
    public function editAction($profile, $key)
    {
        return array(
            'listProfile' => $profile,
            'listKey'     => $key,
            'list'        => $this
                ->get('metador_configuration')
                ->get($key, 'list-option', $profile)
        );
    }

    /**
     * @Method("POST")
     * @Route("/add/{profile}/{key}/", name="metador_admin_lists_add")
     * @param $profile
     * @param $key
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function addAction($profile, $key)
    {
        $params = $this->get('request_stack')->getCurrentRequest()->request->all();

        if (!empty($params['new_list_item_key']) && !empty($params['new_list_item_value'])) {
            $value = $this->get('metador_configuration')->get($key, 'list-option', $profile, array());
            $value[$params['new_list_item_key']] = $params['new_list_item_value'];
            $this->get('metador_configuration')->set($key, $value, 'list-option', $profile);
        }

        return $this->redirectToRoute('metador_admin_lists_edit', array(
            'profile' => $profile,
            'key'     => $key
        ));
    }

    /**
     * @Method("POST")
     * @Route("/update/{profile}/{key}/", name="metador_admin_lists_update")
     * @param $profile
     * @param $key
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function updateAction($profile, $key)
    {
        $params = $this->get('request_stack')->getCurrentRequest()->request->all();

        if (!empty($params['item'])) {
            $value = array();

            foreach ($params['item'] as $item) {
                if (isset($item['delete'])) {
                    continue;
                }
                $value[$item['key']] = $item['value'];
            }

            $this->get('metador_configuration')->set($key, $value, 'list-option', $profile);
        }

        return $this->redirectToRoute('metador_admin_lists_edit', array(
            'profile' => $profile,
            'key'     => $key
        ));
    }
}
