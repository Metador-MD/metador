<?php

namespace WhereGroup\Plugin\InternationalizationBundle\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * @Route("/admin/locale")
 */
class LocaleController extends Controller
{
    /**
     * @Route("/update/{locale}", name="metador_admin_locale_update")
     * @Method("POST")
     */
    public function localeAction($locale)
    {
        $this->get('request')->setLocale($locale);
        $this->get('session')->set('_locale', $locale);
        return $this->redirect($this->get('request')->headers->get('referer'));
    }

    /**
     * @Route("/edit", name="metador_admin_locale_edit")
     * @Method("GET")
     * @Template()
     */
    public function editAction()
    {
        return array(
            'locales' => $this->getParameter('i18n_locales'),
            'bundles' => $this->get('metador_locale')->getBundles()
        );
    }

    /**
     * @Route("/translation/", name="metador_admin_locale_translation")
     * @Method("GET")
     * @Template()
     */
    public function translationAction(Request $request)
    {
        return array(
            'translations' => $this->get('metador_locale')->getTranslations(
                $request->get('domain', null),
                $request->get('locale', null),
                $request->get('bundle', null)
            )
        );
    }

    /**
     * @Route("/update/translation", name="metador_admin_locale_update_translation")
     * @Method("POST")
     */
    public function updateAction(Request $request)
    {
        return new JsonResponse(array(
            'status' => $this->get('metador_locale')->setTranslations(
                $request->get('domain', null),
                $request->get('locale', null),
                $request->get('bundle', null),
                $request->get('key', null),
                $request->get('translation', null)
            )
        ));
    }
}
