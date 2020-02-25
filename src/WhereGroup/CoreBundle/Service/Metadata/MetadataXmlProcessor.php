<?php

namespace WhereGroup\CoreBundle\Service\Metadata;

use DOMDocument;
use DOMXPath;
use Exception;
use RuntimeException;
use Symfony\Component\HttpKernel\KernelInterface;
use WhereGroup\CoreBundle\Component\XmlParser;
use WhereGroup\CoreBundle\Component\XmlParserFunctions;
use WhereGroup\PluginBundle\Component\Plugin;

/**
 * Class MetadataXmlProcessor
 * @package WhereGroup\CoreBundle\Service\Metadata
 */
class MetadataXmlProcessor
{
    /** @var  Plugin */
    protected $plugin;

    /** @var KernelInterface */
    protected $kernel;

    /**
     * MetadataConverter constructor.
     * @param Plugin $plugin
     * @param KernelInterface $kernel
     */
    public function __construct(Plugin $plugin, KernelInterface $kernel)
    {
        $this->plugin = $plugin;
        $this->kernel = $kernel;
    }

    public function __destruct()
    {
        unset($this->plugin, $this->kernel);
    }

    /**
     * @param $xml
     * @param $profile
     * @return array
     */
    public function xmlToObjectByProfile($xml, $profile): array
    {
        $parser = new XmlParser($xml, new XmlParserFunctions());

        $result = $parser->loadSchema(file_get_contents(
            $this->findSchemaByProfileName($profile)
        ))->parse();

        $result['p']['_profile'] = $profile;

        if (!empty($result['p']['fileIdentifier'])) {
            $result['p']['_uuid'] = $result['p']['fileIdentifier'];
        }

        if (empty($result['p']['_uuid'])) {
            throw new RuntimeException("FileIdentifier not found.");
        }

        if (empty($result['p']['hierarchyLevel'])) {
            throw new RuntimeException("HierarchyLevel not found.");
        }

        return $result['p'];
    }

    /**
     * @param $xml
     * @param $mapping
     * @return array
     */
    public function xmlToObjectByMapping($xml, $mapping): array
    {
        $hierarchyLevel = $this->findHierarchyLevelFromXml($xml);

        if (is_null($hierarchyLevel)) {
            throw new RuntimeException("HierarchLevel not found.");
        } elseif (!isset($mapping[$hierarchyLevel])) {
            throw new RuntimeException("HierarchLevel not found in Mapping.");
        }

        return $this->xmlToObjectByProfile($xml, $mapping[$hierarchyLevel]);
    }

    /**
     * @param $xml
     * @return string|null
     */
    public function findHierarchyLevelFromXml($xml)
    {
        $dom = new DOMDocument();
        $dom->loadXml($xml);

        $xpath = new DOMXPath($dom);
        $xpath->registerNamespace('gmd', 'http://www.isotc211.org/2005/gmd');
        $xpath->registerNamespace('gco', 'http://www.isotc211.org/2005/gco');
        $xpath->registerNamespace('srv', 'http://www.isotc211.org/2005/srv');
        $xpath->registerNamespace('gml', 'http://www.opengis.net/gml');
        $xpath->registerNamespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance');

        $result = $xpath->query("/*/gmd:hierarchyLevel/gmd:MD_ScopeCode/text()");
        if ($result->length === 1) {
            return $result->item(0)->nodeValue;
        }

        $result = $xpath->query("/*/gmd:hierarchyLevel/gmd:MD_ScopeCode/@codeListValue");
        if ($result->length === 1) {
            return $result->item(0)->value;
        }

        return null;
    }

    /**
     * @param string $profile
     * @return array|string
     */
    protected function findSchemaByProfileName(string $profile)
    {
        try {
            return $this->kernel->locateResource(
                '@' . $this->plugin->getPluginClassName($profile) . '/Resources/config/import.json'
            );
        } catch (Exception $e) {
            return null;
        }
    }
}
