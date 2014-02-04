<?php

namespace WhereGroup\MetadorBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Response;

use WhereGroup\MetadorBundle\Entity\Metadata;
use WhereGroup\MetadorBundle\Component\MetadorController;


/**
 * @Route("/api")
 */
class ApiController extends MetadorController
{
    /**
     * @Route("/insert")
     * @Method("POST")
     */
    public function insertAction() {
        $content = $this->get("request")->getContent();
        
        if (empty($content) || ($p = json_decode($content)) === null)
            throw new \RuntimeException('Error');

        $this->saveMetadata((array)$p);

        $response = new Response();
        $response->headers->set('ContentType', 'application/json');
        $response->setContent(json_encode(array(
            'status' => 'ok'
        )));

        return $response;
    }

    /**
     * @Route("/update/{id}")
     * @Method("POST")
     */
    public function updateAction($id) {
        $content = $this->get("request")->getContent();

        if (empty($content) || ($p = json_decode($content)) === null)
            throw new \RuntimeException('Error');

        $this->saveMetadata((array)$p, $id);

        $response = new Response();
        $response->headers->set('ContentType', 'application/json');
        $response->setContent(json_encode(array(
            'status' => 'ok'
        )));

        return $response;
    }

    /**
     * @Route("/delete/{id}")
     * @Method("POST")
     */
    public function deleteAction($id) {
        $this->deleteMetadata($id);

        $response = new Response();
        $response->headers->set('ContentType', 'application/json');
        $response->setContent(json_encode(array(
            'status' => 'ok'
        )));

        return $response;
    }

    /**
     * @Route("/get/{id}")
     * @Method("GET")
     */
    public function getAction($id) {
        $metadata = $this->loadMetadata($id);

        $response = new Response();
        $response->headers->set('ContentType', 'application/json');
        $response->setContent(json_encode(array(
            'id' => $metadata->getId(),
            'object' => $metadata->getObject(),
            'status' => 'ok'
        )));

        return $response;
    }


    /**
     * @Route("/getbyuuid/{uuid}")
     * @Method("GET")
     */
    public function getByUuidAction($uuid) {
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
