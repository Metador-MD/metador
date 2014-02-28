<?php

namespace WhereGroup\MetadorBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Response;

/**
 * @Route("/api")
 */
class ApiController extends Controller
{
    /**
     * @Route("/insert")
     * @Method("POST")
     */
    public function insertAction() {
        $content = $this->get("request")->getContent();
        $metadata = $this->get('metador_metadata');

        if (empty($content) || ($p = json_decode($content, true)) === null)
            throw new \RuntimeException('Error');

        $metadata->saveObject($p);

        $response = new Response();
        $response->headers->set('ContentType', 'application/json');
        $response->setContent(json_encode(array(
            'status' => 'ok'
        )));

        return $response;
    }

    /**
     * @Route("/update/{uuid}")
     * @Method("POST")
     */
    public function updateAction($uuid) {
        $content = $this->get("request")->getContent();

        if (empty($content) || ($p = json_decode($content, true)) === null)
            throw new \RuntimeException('Error');

        $data = $this->get('doctrine')
            ->getManager()
            ->getRepository('WhereGroupMetadorBundle:Metadata')
            ->findByUuid($uuid);

        if (!isset($data[0]) && !($data[0] instanceof Metadata))
            throw new \RuntimeException('Metadata not found.');
        
        $metadata = $this->get('metador_metadata');
        $metadata->saveObject($p, $data[0]->getId());

        $response = new Response();
        $response->headers->set('ContentType', 'application/json');
        $response->setContent(json_encode(array(
            'status' => 'ok'
        )));

        return $response;
    }

    /**
     * @Route("/delete/{uuid}")
     * @Method("POST")
     */
    public function deleteAction($uuid) {
        $data = $this->get('doctrine')
            ->getManager()
            ->getRepository('WhereGroupMetadorBundle:Metadata')
            ->findByUuid($uuid);

        if (!isset($data[0]) && !($data[0] instanceof Metadata))
            throw new \RuntimeException('Metadata not found.');

        $metadata = $this->get('metador_metadata');
        $metadata->deleteById($data[0]->getId());

        $response = new Response();
        $response->headers->set('ContentType', 'application/json');
        $response->setContent(json_encode(array(
            'status' => 'ok'
        )));

        return $response;
    }

    /**
     * @Route("/get/{uuid}")
     * @Method("GET")
     */
    public function getAction($uuid) {
        $metadata = $this->get('doctrine')
            ->getManager()
            ->getRepository('WhereGroupMetadorBundle:Metadata')
            ->findByUuid($uuid);

        if (!isset($metadata[0]) && !($metadata[0] instanceof Metadata))
            throw new \RuntimeException('Metadata not found.');
        
        $response = new Response();
        $response->headers->set('ContentType', 'application/json');
        $response->setContent(json_encode(array(
            'id' => $metadata[0]->getId(),
            'object' => $metadata[0]->getObject(),
            'status' => 'ok'
        )));

        return $response;
    }
}
