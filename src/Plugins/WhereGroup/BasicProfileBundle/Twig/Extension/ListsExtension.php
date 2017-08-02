<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Twig\Extension;

use WhereGroup\CoreBundle\Component\Configuration;

/**
 * Class ListsExtension
 * @package Plugins\WhereGroup\BasicProfileBundle\Twig\Extension
 */
class ListsExtension extends \Twig_Extension
{
    /** @var Configuration  */
    private $conf;

    /**
     * ListsExtension constructor.
     * @param Configuration $conf
     */
    public function __construct(Configuration $conf)
    {
        $this->conf = $conf;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction(
                'get_list_options',
                array($this, 'getListOptions'),
                array('is_safe' => array('html'))
            )
        );
    }

    /**
     * @param $profile
     * @param $key
     * @return string
     */
    public function getListOptions($profile, $key, $sort = null)
    {
        $options = $this->conf->get($key, 'list-option', $profile);

        if (is_null($options)) {
            $this->conf->set($key, array(), 'list-option', $profile);
            $options = array();
        }

        return $options;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_lists";
    }
}
