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

    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;

        $controllerInfo = $container->get('request')->get('_controller');

        $this->bundle     = $this->parse("/\\\([\w]*)Bundle\\\/i", $controllerInfo);
        $this->controller = $this->parse("/Controller\\\([\w]*)Controller/i", $controllerInfo);
        $this->action     = $this->parse("/\:([\w]*)Action/i", $controllerInfo);
        $this->route      = $container->get('request')->get('_route');

        unset($controllerInfo);

        $this->data = array();
        $this->dataEnd = array();

        // dispatch event
        $event = new ApplicationEvent($this, array());
        $container->get('event_dispatcher')->dispatch('application.loading', $event);

        // die('<pre>' . print_r($this->data, 1) . '</pre>');
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
    public function get($type, $key = null)
    {
        $merged = array_merge_recursive($this->data, $this->dataEnd);

        if (is_null($key)) {
            return isset($merged[$type]) ? $merged[$type] : array();
        }

        return isset($merged[$type][$key]) ? $merged[$type][$key] : '';
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
