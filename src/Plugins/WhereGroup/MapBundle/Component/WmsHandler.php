<?php

namespace Plugins\WhereGroup\MapBundle\Component;

use Doctrine\ORM\EntityManagerInterface;
use Plugins\WhereGroup\MapBundle\Entity\Wms as WmsEntity;

/**
 * Class WmsLoader
 * @package Plugins\WhereGroup\MapBundle\Component
 */
class WmsHandler implements WmsInterface
{
    /** @var \Doctrine\Common\Persistence\ObjectRepository|null|\Plugins\WhereGroup\MapBundle\Entity\WmsRepository */
    protected $repo = null;

    const ENTITY = "MetadorMapBundle:Wms";

    /** @param EntityManagerInterface $em */
    public function __construct(EntityManagerInterface $em)
    {
        $this->repo = $em->getRepository(self::ENTITY);
    }

    public function __destruct()
    {
        unset(
            $this->repo
        );
    }

    /**
     * @param $id
     */
    public function get($id)
    {
        return $this->repo->findOneById($id);
    }

    /**
     * @return array|\WhereGroup\CoreBundle\Entity\Source[]
     */
    public function all()
    {
        return $this->repo->findBy(array(), array('priority' => 'ASC'));
    }

    /**
     * @param $entity
     * @return $this
     */
    public function save($entity)
    {
        $this->repo->save($entity);

        return $this;
    }

    /**
     * @param $entity
     * @return $this
     */
    public function remove($entity)
    {
        $this->repo->remove($entity);

        return $this;
    }

    /**
     * Updates a wms entity object from WMS GetCapabilities document
     * @param $url a valid url for WMS GetCapabilities document
     * @param WmsEntity $wms wms eintity to update from given url
     * @return WmsEntity
     */
    public function update($url, WmsEntity &$wms)
    {
        $url_ = WmsHandler::getValidGcUrl($url);
        $doc = WmsCapabilitiesParser::createDocument($this->getContent($url_));
        $parser = WmsCapabilitiesParser::getParser($doc);

        return $parser->parse($wms);
    }

    /**
     * Returns a content from given url
     * @param $url url for WMS GetCapabilities document
     * @return bool|string
     * @throws \Exception
     */
    private static function getContent($url)
    {
        $content = @file_get_contents($url);
        if ($content === false) {
            throw new \Exception('Kein Content von '.$url);
        }

        return $content;
    }

    /**
     * Returns a valid url for given WMS GetCapabilities url
     * @param $url url for WMS GetCapabilities document
     * @return null|string
     */
    private static function getValidGcUrl($url)
    {
        if ((bool)($urlArray = parse_url(trim($url)))) {
            $service = null;
            $request = null;
            $version = null;
            $getParams = array();
            if (isset($urlArray['query'])) {
                parse_str($urlArray['query'], $getParams);
                foreach ($getParams as $key => $value) {
                    if (strtoupper($key) === 'SERVICE') {
                        $service = strtoupper($value);
                    } elseif (strtoupper($key) === 'REQUEST') {
                        $request = strtoupper($value);
                    } elseif (strtoupper($key) === 'VERSION') {
                        $version = strtoupper($value);
                    }
                }
            }

            if (!$service) {
                $getParams['SERVICE'] = 'WMS';
            }
            if (!$request) {
                $getParams['REQUEST'] = 'GetCapabilities';
            }
            if (!$version) {
                $getParams['VERSION'] = '1.3.0';
            }
            $pos = strpos($url, '?');
            $query = http_build_query($getParams);
            if ($pos === false) {
                $urlNew = $url.'?'.$query;
            } else {
                $urlNew = substr($url, 0, $pos + 1).$query;
            }

            return $urlNew;
        } else {
            return null;
        }
    }

    /**
     * Returns a OpanLayers 4 representation for a given wms.
     * @param WmsEntity $wms
     * @return array
     */
    public function toOl4(WmsEntity $wms)
    {
        return array(
            'type' => $wms::$type,
            'url' => $wms->getGmUrl(),
            'title' => $wms->getTitle(),
            'visible' => $wms->getVisible(),
            'opacity' => $wms->getOpacity(),
            'params' => array(
                'LAYERS' => implode(',', $wms->getLayers()),
                'VERSION' => $wms->getVersion(),
                'FORMAT' => $wms->getFormat(),
            ),
        );
    }
}