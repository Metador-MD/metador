<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use WhereGroup\SearchBundle\Component\Paging;

/**
 * @Route("/metador")
 */
class ExportController extends Controller
{
    /**
     * @Route("/xml/{id}", name="metador_export_xml")
     * @Method("GET")
     */
    public function xmlAction($id)
    {
        $granted = $this
            ->get('security.authorization_checker')
            ->isGranted('ROLE_USER');

        if ($data = $this->get('metadata')->getById($id)) {
            $p = $data->getObject();

            if ($granted === true || $data->getPublic() === true) {
                return $this->forward('Profile' . ucfirst($p['_profile']) . 'Bundle:Profile:xml', array(
                    'data' => array(
                        'p' => $p,
                    )
                ));
            }

            $xml = $this->render("WhereGroupCoreBundle::exception.xml.twig", array(
                "message" => "Zugriff verweigert."
            ));

        } else {
            $xml = $this->render("WhereGroupCoreBundle::exception.xml.twig", array(
                "message" => "Datensatz nicht gefunden."
            ));
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'text/xml');
        $response->setContent($xml->getContent());

        return $response;
    }

    /**
     * @Route("/obj/{id}", name="metador_export_obj")
     * @Method("GET")
     */
    public function objAction($id)
    {
        $data = $this->get('metadata')->getById($id);

        if ($data) {
            $p = $data->getObject();

            ksort($p);

            return new Response('<pre>' . print_r($p, 1) . '</pre>');
        }

        return new Response('Datensatz nicht gefunden.');
    }

    /**
     * @Route("/pdf/{id}", name="metador_export_pdf")
     * @Method("GET")
     */
    public function pdfAction($id)
    {
        $data = $this->get('metadata')->getById($id);

        if ($data) {
            $p = $data->getObject();

            ksort($p);

            return $this->forward('Profile' . ucfirst($p['_profile']) . 'Bundle:Profile:pdf', array(
                'data' => array(
                    'p' => $p,
                )
            ));
        }

        return new Response('Datensatz nicht gefunden.');
    }

    /**
    * @Route("/html/{id}", name="metador_export_html")
    * @Method("GET")
    */
    public function htmlAction($id)
    {

        $data = $this->get('metadata')->getById($id);

        if ($data) {
            $p = $data->getObject();

            ksort($p);
            return $this->forward('Profile' . ucfirst($p['_profile']) . 'Bundle:Profile:html', array(
                'data' => array(
                    'p' => $p,
                )
            ));
        }

        return new Response('Datensatz nicht gefunden.');
    }
}
