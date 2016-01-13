<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class Application
 * @package WhereGroup\CoreBundle\Component
 */
class Application
{
    private $data                 = array();
    private $bundle               = null;
    private $controller           = null;
    private $action               = null;
    private $route                = null;
    private $parameter            = null;
    private $env                  = null;
    private $requestStack         = null;
    private $authorizationChecker = null;

    const POSITION_PREPEND = 0;
    const POSITION_NORMAL  = 1;
    const POSITION_APPEND  = 2;

    public function __construct(
        EventDispatcherInterface $eventDispatcher,
        AuthorizationCheckerInterface $authorizationChecker,
        RequestStack $requestStack,
        $env
    ) {
        try {
            $this->env                  = $env;
            $this->authorizationChecker = $authorizationChecker;
            $this->requestStack         = $requestStack;

            // dispatch event
            $eventDispatcher->dispatch('application.loading', new ApplicationEvent($this, array()));
        } catch (\Exception $e) {
        }
    }

    public function updateInformation()
    {
        if (is_null($this->route)) {
            $request         = $this->requestStack->getCurrentRequest();
            $this->parameter = $request->attributes->all();
            $this->route     = $request->get('_route');
            $controllerInfo  = $request->get('_controller');

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
        }
    }

    public function debug()
    {
        $this->updateInformation();

        return
            "\n<br/>Bundle     : " . $this->bundle .
            "\n<br/>Controller : " . $this->controller .
            "\n<br/>Action     : " . $this->action .
            "\n<br/>Route      : " . $this->route .
            'Data: <pre>' . print_r($this->data, 1) . '</pre>' .
            'Parameter:<pre>' . print_r($this->parameter, 1) . '</pre>';
    }

    /**
     * @param $type
     * @param $key
     * @param $data
     * @param null $role
     * @return $this
     */
    public function add($type, $key, $data, $role = null, $position = self::POSITION_NORMAL)
    {
        $this->updateInformation();

        try {
            if (!is_null($role) && false === $this->authorizationChecker->isGranted($role)) {
                return $this;
            }
        } catch (\Exception $e) {
            return $this;
        }

        if (isset($data['path']) && $data['path'] === $this->route) {
            $data['active'] = true;
        }

        $this->data[$position][$type][$key] = $data;

        return $this;
    }

    public function prepend($type, $key, $data, $role = null)
    {
        return $this->add($type, $key, $data, $role, self::POSITION_PREPEND);
    }

    public function append($type, $key, $data, $role = null)
    {
        return $this->add($type, $key, $data, $role, self::POSITION_APPEND);
    }

    /**
     * @param $type
     * @param null $key
     * @return array|string
     */
    public function get($type, $key = null, $default = null)
    {
        $merged = array_merge_recursive(
            isset($this->data[self::POSITION_PREPEND]) ? $this->data[self::POSITION_PREPEND] : array(),
            isset($this->data[self::POSITION_NORMAL])  ? $this->data[self::POSITION_NORMAL]  : array(),
            isset($this->data[self::POSITION_APPEND])  ? $this->data[self::POSITION_APPEND]  : array()
        );

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
        $this->updateInformation();

        if (!is_null($parameter)) {
            return isset($this->parameter[$parameter])
                ? $this->parameter[$parameter]
                : $default;
        }

        return $this->parameter;
    }

    public function isEnv($env)
    {
        return ($this->env === $env);
    }

    /**
     * @param $bundle
     * @return bool
     */
    public function isBundle($bundle)
    {
        $this->updateInformation();

        return ($this->bundle === $bundle);
    }

    public function getBundle()
    {
        $this->updateInformation();

        return $this->bundle;
    }

    /**
     * @param $controller
     * @return bool
     */
    public function isController($controller)
    {
        $this->updateInformation();

        return ($this->controller === $controller);
    }

    /**
     * @param $action
     * @return bool
     */
    public function isAction($action)
    {
        $this->updateInformation();

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
        $this->updateInformation();

        if (is_array($route)) {
            return in_array($this->route, $route);
        }

        return ($this->route === $route);
    }

    public function routeStartsWith($string)
    {
        $this->updateInformation();

        return (strncmp($this->route, $string, strlen($string)) === 0);
    }

    public function bundleStartsWith($string)
    {
        $this->updateInformation();

        return (strncmp($this->bundle, $string, strlen($string)) === 0);
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
