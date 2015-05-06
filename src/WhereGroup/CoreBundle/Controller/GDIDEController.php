<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Response;

use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\CoreBundle\Component\TestsuiteDocument;

/**
 * @Route("/gdi-de")
 */
class GDIDEController extends Controller
{
    /**
     * @Route("/show/{id}")
     * @Template()
     */
    public function showAction($id)
    {
        $config = $this->container->getParameter('metador');

        if (!isset($config['gdi_de'])) {
            return array();
        }

        $p = array();
        $metadataClasses = array();

        if (($metadata = $this->loadMetadata($id))) {
            $p = $metadata->getObject();

            $doc = new TestsuiteDocument(
                $config['gdi_de']['url'],
                $config['gdi_de']['user'],
                $config['gdi_de']['password'],
                isset($config['proxy']['host']) ? $config['proxy']['host'] : null,
                isset($config['proxy']['port']) ? $config['proxy']['port'] : null
            );

            // POST
            if (($conformity = $this->getRequest()->request->get('conformity', false))
                && ($xml = $this->renderXml($p))) {
                $doc->setTestById($conformity);
                $doc->setTkId($this->getRequest()->request->get('tkid'));
                $doc->setXml($xml, $id . '.xml');
                $doc->setName($id . '.xml');
                $doc->setDescription('MeTaDor XML Nr. ' . $id);
                $doc->addDocument();
                $doc->testDocument();

                for ($i=0; $i<20; $i++) {
                    $status = $doc->getDocumentStatus();
                    sleep(2);

                    if ($status === "Finish") {
                        $result = $doc->getTestReport($doc->getReportId());

                        // TODO: delete test reports
                        // $doc->deleteAllTestReport();

                        return $this->get('templating')->renderResponse(
                            'WhereGroupCoreBundle:GDIDE:result.html.twig',
                            array(
                                'id' => $id,
                                'result' => $result
                            )
                        );
                    }
                }
            }

            $classes = $doc->getTestClasses();

            foreach ($classes->item as $item) {
                if (substr($item->Name, 0, strlen('Metadaten')) == 'Metadaten') {
                    $metadataClasses[] = $item;
                }
            }
        }

        return $this->get('templating')->renderResponse(
            'WhereGroupCoreBundle:GDIDE:show.html.twig',
            array(
                'p' => $p,
                'classes' => $metadataClasses
            )
        );
    }

    private function loadMetadata($id)
    {
        return $this->getDoctrine()
            ->getManager()
            ->getRepository('WhereGroupCoreBundle:Metadata')
            ->findOneById($id);
    }

    private function renderXml($p)
    {
        $data = array('p' => $p);

        $conf = $this->container->getParameter('metador');

        switch($p['hierarchyLevel']) {
            case 'service':
                $template = $conf['templates']['form'] . ':Service:service.xml.twig';
                break;
            case 'dataset':
            case 'series':
                $template = $conf['templates']['form'] . ':Dataset:dataset.xml.twig';
                break;
            default:
                $template = "WhereGroupCoreBundle::exception.xml.twig";
                $data = array('message' => 'HierarchyLevel unbekannt!');
        }

        $xml = $this->render($template, $data);
        return $xml->getContent();
    }
}
