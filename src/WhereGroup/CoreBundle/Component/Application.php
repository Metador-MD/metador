<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class Application
 * @package WhereGroup\CoreBundle\Component
 */
class Application
{
    private $container;
    private $data;
    private $dataEnd;
    private $bundle;
    private $controller;
    private $action;
    private $route;
    private $parameter;

    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
        $controllerInfo  = $container->get('request')->get('_controller');
        $this->parameter = $container->get('request')->attributes->all();
        $this->route     = $container->get('request')->get('_route');
        $this->data      = array();
        $this->dataEnd   = array();

        // Forward to controller generates a different controller information
        if (preg_match("/^([a-z0-9]+)Bundle:([^:]+):(.+)$/i", $controllerInfo, $match)) {
            $this->bundle     = $match[1];
            $this->controller = $match[2];
            $this->action     = $match[3];
        } else {
            $this->bundle     = $this->parse("/\\\([\w]*)Bundle\\\/i", $controllerInfo);
            $this->controller = $this->parse("/Controller\\\([\w]*)Controller/i", $controllerInfo);
            $this->action     = $this->parse("/\:([\w]*)Action/i", $controllerInfo);
        }

        unset($controllerInfo);

        // dispatch event
        $event = new ApplicationEvent($this, array());
        $container->get('event_dispatcher')->dispatch('application.loading', $event);
    }

    /**
     * @param $type
     * @param $key
     * @param $data
     * @param null $role
     * @return $this
     */
    public function add($type, $key, $data, $role = null, $append = false)
    {
        if (!is_null($role) && false === $this->container->get('security.context')->isGranted($role)) {
            return $this;
        }

        //$data['active'] = false;
        if (isset($data['path']) && $data['path'] === $this->route) {
            $data['active'] = true;
        }

        if ($append) {
            $this->dataEnd[$type][$key] = $data;
        } else {
            $this->data[$type][$key] = $data;
        }

        return $this;
    }

    /**
     * @param $type
     * @param $key
     * @param $data
     * @param null $role
     * @return $this
     */
    public function append($type, $key, $data, $role = null)
    {
        return $this->add($type, $key, $data, $role, true);
    }

    /**
     * @param $type
     * @param null $key
     * @return array|string
     */
    public function get($type, $key = null, $default = null)
    {
        $merged = array_merge_recursive($this->data, $this->dataEnd);

        if (is_null($key)) {
            return isset($merged[$type])
                ? $merged[$type]
                : (is_null($default) ? array() : $default);
        }

        return isset($merged[$type][$key])
            ? $merged[$type][$key]
            : (is_null($default) ? '' : $default);
    }

    public function getParameter($parameter = null, $default = null)
    {
        if (!is_null($parameter)) {
            return isset($this->parameter[$parameter])
                ? $this->parameter[$parameter]
                : $default;
        }

        return $this->parameter;
    }

    /**
     * @param $bundle
     * @return bool
     */
    public function isBundle($bundle)
    {
        return ($this->bundle === $bundle);
    }

    /**
     * @param $controller
     * @return bool
     */
    public function isController($controller)
    {
        return ($this->controller === $controller);
    }

    /**
     * @param $action
     * @return bool
     */
    public function isAction($action)
    {
        if (is_array($action)) {
            return in_array($this->action, $action);
        }

        return ($this->action === $action);
    }

    /**
     * @param $route
     * @return bool
     */
    public function isRoute($route)
    {
        if (is_array($route)) {
            return in_array($this->route, $route);
        }

        return ($this->route === $route);
    }

    /**
     * @param $regex
     * @param $string
     * @return string
     */
    private function parse($regex, $string)
    {
        $matches = array();

        preg_match($regex, $string, $matches);

        return isset($matches[1]) ? strtolower($matches[1]) : '';
    }
}
