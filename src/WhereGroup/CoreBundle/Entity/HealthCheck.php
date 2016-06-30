<?php

namespace WhereGroup\CoreBundle\Entity;

/**
 * Class HealthCheck
 * @package WhereGroup\CoreBundle\Entity
 */
class HealthCheck
{
    protected $log = array();

    /**
     * HealthCheck constructor.
     */
    public function __construct()
    {
        $this->log = array(
            'warning' => array(),
            'error'   => array()
        );
    }

    /**
     * @param $origin
     * @param $message
     * @return $this
     */
    public function addWarning($origin, $message)
    {
        $this->log['warning'][] = array(
            'origin'  => $origin,
            'message' => $message
        );

        return $this;
    }

    /**
     * @return array
     */
    public function getResult()
    {
        return $this->log;
    }
}
