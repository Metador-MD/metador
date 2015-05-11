<?php

namespace WhereGroup\Plugin\InternationalizationBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\SearchBundle\Component\Paging;

class LocaleController extends Controller
{
    /**
     *
     */
    public function setLocaleAction()
    {
        $request->getSession()->set('_locale', $locale);
        return $data;
    }
}
