<?php

namespace Plugins\WhereGroup\ManualBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;

/**
 * Class ManualEvent
 * @package Plugins\WhereGroup\ManualBundle\Event
 */
class ManualEvent extends Event
{
    protected $index = [];
    protected $authorizationChecker;
    protected $env;
    protected $manualType;

    /**
     * @param $path
     * @param $label
     * @param $class
     * @param $template
     * @param $role
     * @param null $env
     * @return ManualEvent
     */
    public function add($path, $label, $class, $template, $role = null, $env = null)
    {
        if ((!is_null($env) && $this->env !== $env) ||
            (substr($path, 0, strlen($this->manualType)) !== $this->manualType) ||
            (!is_null($role) && !$this->authorizationChecker->isGranted($role))) {
            return $this;
        }

        ArrayParser::set($this->index, $path . ':' . $label, [
            'manual'   => $path,
            'label'    => $label,
            'class'    => $class,
            'template' => $template,
            'role'     => $role,
            'env'      => $env
        ]);

        return $this;
    }

    /**
     * @param null $manual
     * @return array
     */
    public function getIndex($manual = null)
    {
        if (is_null($manual)) {
            return $this->index;
        }

        if (empty($this->index[$manual])) {
            return [];
        }

        ksort($this->index[$manual]);

        return $this->index[$manual];
    }

    /**
     * @param $environment
     * @return $this
     */
    public function setEnvironment($environment)
    {
        $this->env = $environment;
        return $this;
    }

    /**
     * @param AuthorizationChecker $authorizationChecker
     * @return $this
     */
    public function setAuthorizationChecker(AuthorizationChecker $authorizationChecker)
    {
        $this->authorizationChecker = $authorizationChecker;
        return $this;
    }

    /**
     * @param string $manual
     * @return $this
     */
    public function setManualType(string $manual)
    {
        $this->manualType = $manual;
        return $this;
    }
}
