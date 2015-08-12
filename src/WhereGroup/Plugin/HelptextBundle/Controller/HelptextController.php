<?php

namespace WhereGroup\Plugin\HelptextBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use WhereGroup\Plugin\HelptextBundle\Entity\Helptext;

/**
 * @Route("/metador")
 */
class HelptextController extends Controller
{
    /**
     * @Route("/help/get", name="metador_helptext_get")
     * @Method("GET")
     */
    public function getHelptext(Request $request)
    {
        $id = $request->get('id', false);
        $em = $this->getDoctrine()->getManager();

        /** @var Helptext $helptext */
        $helptext = $em->getRepository('WhereGroupHelptextBundle:Helptext')->findOneById($id);

        if ($helptext) {
            $text = trim($helptext->getText());

            while (substr($text, -4) === '<br>') {
                $text = trim(preg_replace('/<br>$/', '', trim($text)));
            }

            while (substr($text, 0, 4) === '<br>') {
                $text = trim(preg_replace('/^<br>/', '', trim($text)));
            }

            if ($this->get('security.authorization_checker')->isGranted('ROLE_HELPTEXT_ADMIN')) {
                $string = $text;
            } else {
                $string = $this->get('translator')->trans($text);
            }

        } else {
            $string = "Hilfetext nicht definiert.";
        }

        $html = $this->render("WhereGroupThemeBundle:Template:helptext.html.twig", array(
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
    public function setHelptext(Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_HELPTEXT_ADMIN')) {
            throw new AccessDeniedException();
        }

        $id   = $request->get('id', null);
        $html = $request->get('html', null);

        if (is_null($id) || is_null($html)) {
            throw new \Exception("ID oder HTML Parameter nicht gefunden.", 1);
        }

        $em = $this->getDoctrine()->getManager();

        /** @var Helptext $helptext */
        $helptext = $em->getRepository('WhereGroupHelptextBundle:Helptext')->findOneById($id);

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

        $response = new Response();
        $response->headers->set('Content-Type', 'text/html');
        $response->setContent('done');
        return $response;
    }
}
