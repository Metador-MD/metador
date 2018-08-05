<?php

namespace WhereGroup\CoreBundle\Event;

use Symfony\Component\EventDispatcher\Event;

/**
 * Class MetadataValidationEvent
 * @package WhereGroup\CoreBundle\Event
 */
class MetadataValidationEvent extends Event
{
    /**
     * @var array
     */
    protected $p;

    /**
     * @var array
     */
    protected $rules;

    /**
     * @var array
     */
    public $debug;

    /**
     * MetadataValidationEvent constructor.
     * @param array $p
     * @param array $rules
     * @param array $debug
     */
    public function __construct(array $p, array $rules, &$debug)
    {
        $this->p = $p;
        $this->rules = $rules;
        $this->debug = &$debug;
    }

    /**
     * @return array
     */
    public function getObject()
    {
        return $this->p;
    }

    /**
     * @return array
     */
    public function getRules()
    {
        return $this->rules;
    }
}

