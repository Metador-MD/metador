<?php

namespace Plugins\WhereGroup\PublishBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use WhereGroup\CoreBundle\Entity\Metadata;

/**
 * @Route("/publish/")
 */
class PublishController extends Controller
{
    /**
     * @Route("metadata/", name="metador_publish_metadata")
     * @Method("POST")
     */
    public function publishAction()
    {
        $id = $this->get('request')->request->get('id', null);
        $status = $this->get('request')->request->get('status', null);

        if (is_null($id) || is_null($status)) {
            throw new \RuntimeException("ID or status empty");
        }

        $status = filter_var($status, FILTER_VALIDATE_BOOLEAN);

        /** @var Metadata $entity */
        $entity = $this->get('metadata')->getById($id);
        $entity->setPublic($status);

        $this->get('metadata')->save($entity);

        return new JsonResponse(array(
            'published' => $status
        ));
    }
}
