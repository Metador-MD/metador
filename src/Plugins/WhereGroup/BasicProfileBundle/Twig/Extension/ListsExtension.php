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
     * @param array $default
     * @param null $sort
     * @param null $direction
     * @return string
     * @throws \Doctrine\ORM\NonUniqueResultException
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function getListOptions($profile, $key, $default = [], $sort = null, $direction = null)
    {
        $key = preg_replace('/(_[\d]+_?)/s', '', $key);

        $options = $this->conf->get($key, 'list-option', $profile);

        if (is_null($options)) {
            // Save Template
            if (is_array($default) && !is_string($default[key($default)])) {
                $this->conf->set($key, array_keys($default[key($default)]), 'list-option-template', $profile);
            }

            $options = $default;
            $this->conf->set($key, $options, 'list-option', $profile);
        }

        if ($sort) {
            array_multisort(
                array_map('strtolower', $options), // ignore case
                ($direction === 'desc') ? SORT_DESC : SORT_ASC,
                ($sort === 'numeric') ? SORT_NUMERIC : SORT_STRING,
                $options
            );
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
