<?php

namespace WhereGroup\Plugin\InternationalizationBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\SearchBundle\Component\Paging;

/**
 * @Route("/metador/locale")
 */
class LocaleController extends Controller
{
    /**
     * @Route("/update/{locale}", name="metador_locale_update")
     * @Method("POST")
     */
    public function localeAction($locale)
    {
        $this->get('request')->setLocale($locale);
        $this->get('session')->set('_locale', $locale);
        return $this->redirect($this->get('request')->headers->get('referer'));
    }
}
