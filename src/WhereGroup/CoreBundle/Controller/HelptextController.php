<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\SearchBundle\Component\Paging;
use WhereGroup\MetadorBundle\Entity\Helptext;

/**
 * @Route("/metador")
 */
class HelptextController extends Controller
{
    /**
     * @Route("/help/get", name="metador_helptext_get")
     * @Method("GET")
     */
    public function getHelptext()
    {
        $helptext = new Helptext();
        $string = "";

        $id = $this->getRequest()->get('id', false);

        $em = $this->getDoctrine()->getManager();
        $helptext = $em->getRepository('WhereGroupMetadorBundle:Helptext')->findOneById($id);

        if ($helptext) {
            $string = $helptext->getText();
        } else {
            $string = "Hilfetext nicht definiert.";
        }

        $html = $this->render("WhereGroupMetadorBundle:Design:helptext.html.twig", array(
            "html" => $string
        ));

        $response = new Response();
        $response->headers->set('Content-Type', 'text/html');
        $response->setContent($html->getContent());
        return $response;
    }

    /**
     * @Route("/help/set", name="metador_helptext_set")
     * @Method("POST")
     */
    public function setHelptext()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_METADOR_ADMIN')) {
            throw new AccessDeniedException();
        }

        $id = $this->getRequest()->get('id', false);
        $html = $this->getRequest()->get('html', false);
        $debug = "";

        if ($id && $html) {
            $em = $this->getDoctrine()->getManager();
            $helptext = $em->getRepository('WhereGroupMetadorBundle:Helptext')->findOneById($id);

            $html = str_replace(array('&gt;', '&lt;'), array('>', '<'), $html);
            $html = str_replace(
                array('<div>','</div>'),
                array('',''),
                $html
            );

            if ($helptext) {
                $helptext->setText($html);
            } else {
                $helptext = new Helptext();
                $helptext->setId($id);
                $helptext->setText($html);
            }

            $em->persist($helptext);
            $em->flush();
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'text/html');
        $response->setContent('done');
        return $response;
    }
}
