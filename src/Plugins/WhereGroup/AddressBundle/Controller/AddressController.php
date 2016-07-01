<?php

namespace Plugins\WhereGroup\AddressBundle\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use WhereGroup\CoreBundle\Entity\Address;

/**
 * @Route("/metador")
 */
class AddressController extends Controller
{
    /**
     * @Route("/address/get", name="metador_address_get")
     * @Method("GET")
     */
    public function addressGetAction()
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $array = array();
        $em = $this->getDoctrine()->getManager();
        $addresses = $em->getRepository('MetadorAddressBundle:Address')->findAll();

        foreach ($addresses as $address) {
            $array[] = array(
                'organisationName'      => $address->getOrganisationName(),
                'electronicMailAddress' => $address->getElectronicMailAddress(),
                'role'                  => $address->getRole(),
                'positionName'          => $address->getPositionName(),
                'individualName'        => $address->getIndividualName(),
                'country'               => $address->getCountry(),
                'administrativeArea'    => $address->getAdministrativeArea(),
                'deliveryPoint'         => $address->getDeliveryPoint(),
                'city'                  => $address->getCity(),
                'postalCode'            => $address->getPostalCode(),
                'voice'                 => $address->getVoice(),
                'facsimile'             => $address->getFacsimile(),
                'onlineResource'        => $address->getOnlineResource()
            );
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');
        $response->setContent(json_encode($array));
        return $response;
    }

    /**
     * @Route("/address/delete/{id}", name="metador_address_delete")
     * @Method("POST")
     */
    public function addressDeleteAction($id)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $address = $em->getRepository('MetadorAddressBundle:Address')->findOneById($id);

        try {
            if ($address) {
                $em->remove($address);
                $em->flush();
            }
        } catch (\Exception $e) {
            $this->get('session')->getFlashBag()->add('error', $e->getMessage());
        }

        return $this->redirect($this->generateUrl('metador_dashboard'));
    }
}
