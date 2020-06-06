<?php


namespace WhereGroup\PluginBundle\Component\ApplicationIntegration;

/**
 * Interface ApplicationIntegration
 * @package WhereGroup\PluginBundle\Component\ApplicationIntegration
 */
interface ApplicationIntegration
{
    /**
     * Base constructor.
     * @param $prefix
     */
    public function __construct($prefix);

    /**
     * @param $template
     * @param array $params
     * @param null $prefix
     * @return $this
     */
    public function template($template, $params = [], $prefix = null);

    /**
     * @param $raw
     * @param null $prefix
     * @return $this
     */
    public function raw($raw, $prefix = null);

    /**
     * @return array
     */
    public function getData();

    /**
     * @return mixed
     */
    public function getType();

    /**
     * @param $role
     * @return $this
     */
    public function setRole($role);

    /**
     * @return null
     */
    public function getRole();
}
