<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use WhereGroup\PluginBundle\Component\ApplicationIntegration as Integration;

/**
 * Class Application
 * @package WhereGroup\CoreBundle\Component
 */
class Application
{
    private $data                 = [];
    private $bundle               = null;
    private $controller           = null;
    private $action               = null;
    private $route                = null;
    private $env                  = null;
    private $authorizationChecker = null;

    const POSITION_PREPEND = 0;
    const POSITION_NORMAL  = 1;
    const POSITION_APPEND  = 2;

    /**
     * Application constructor.
     * @param AuthorizationCheckerInterface $authorizationChecker
     * @param $env
     */
    public function __construct(
        AuthorizationCheckerInterface $authorizationChecker,
        $env
    ) {
        $this->authorizationChecker = $authorizationChecker;
        $this->env                  = $env;
    }

    /**
     * @param $route
     * @param $controller
     */
    public function update($route, $controller)
    {
        $this->route = $route;

        // Forward to controller generates a different controller information
        if (preg_match("/^([a-z0-9]+)Bundle:([^:]+):(.+)$/i", $controller, $match)) {
            $this->bundle     = $match[1];
            $this->controller = $match[2];
            $this->action     = $match[3];
        } else {
            $this->bundle     = $this->parse("/\\\([\w]*)Bundle\\\/i", $controller);
            $this->controller = $this->parse("/Controller\\\([\w]*)Controller/i", $controller);
            $this->action     = $this->parse("/\:([\w]*)Action/i", $controller);
        }
    }

    /**
     * @return string
     */
    public function debug()
    {
        return
            "\n<br/>Bundle     : " . $this->bundle .
            "\n<br/>Controller : " . $this->controller .
            "\n<br/>Action     : " . $this->action .
            "\n<br/>Route      : " . $this->route .
            'Data: <pre>' . print_r($this->data, 1) . '</pre>';
    }

    /**
     * @param $type
     * @param $key
     * @param $data
     * @param null $role
     * @param int $position
     * @return $this
     */
    public function register($type, $key, $data, $role = null, $position = self::POSITION_NORMAL)
    {
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

    /**
     * @param Integration\Base $class
     * @param int $position
     * @return $this
     */
    public function add(Integration\Base $class, $position = self::POSITION_NORMAL)
    {
        foreach ($class->getData() as $key => $data) {
            $this->register(
                $class->getType(),
                $key,
                $data,
                $class->getRole(),
                $position
            );
        }

        return $this;
    }

    /**
     * @param Integration\Base $class
     * @return Application
     */
    public function append(Integration\Base $class)
    {
        return $this->add($class, self::POSITION_APPEND);
    }

    /**
     * @param Integration\Base $class
     * @return Application
     */
    public function prepend(Integration\Base $class)
    {
        return $this->add($class, self::POSITION_PREPEND);
    }

    /**
     * @param $class
     * @param null $prefix
     * @return mixed
     * @throws \Exception
     */
    public function get($class, $prefix = null)
    {
        switch (strtolower($class)) {
            case 'script':
                return new Integration\Script($prefix);
            case 'style':
                return new Integration\Style($prefix);
            case 'body':
                return new Integration\Body($prefix);
            case 'dashboard':
                return new Integration\Dashboard($prefix);
            case 'globalmenu':
                return new Integration\GlobalMenu($prefix);
            case 'adminmenu':
                return new Integration\AdminMenu($prefix);
            case 'pagecenter':
                return new Integration\PageCenter($prefix);
            case 'pluginmenu':
                return new Integration\PluginMenu($prefix);
            case 'appinformation':
                return new Integration\AppInformation($prefix);
            case 'profile':
                return new Integration\Profile($prefix);
            case 'searchmenu':
                return new Integration\SearchMenu($prefix);
            case 'profilemenu':
                return new Integration\ProfileMenu($prefix);
            case 'configuration':
                return new Integration\Configuration($prefix);
            default:
                throw new \Exception("Class not found");
        }
    }

    /**
     * @param null $type
     * @param null $key
     * @param null $default
     * @return array|null|string
     */
    public function getData($type = null, $key = null, $default = null)
    {
        if (is_null($type)) {
            return $this->data;
        }

        $merged = array_merge_recursive(
            isset($this->data[self::POSITION_PREPEND]) ? $this->data[self::POSITION_PREPEND] : [],
            isset($this->data[self::POSITION_NORMAL])  ? $this->data[self::POSITION_NORMAL]  : [],
            isset($this->data[self::POSITION_APPEND])  ? $this->data[self::POSITION_APPEND]  : []
        );

        if (is_null($key)) {
            return isset($merged[$type])
                ? $merged[$type]
                : (is_null($default) ? [] : $default);
        }

        return isset($merged[$type][$key])
            ? $merged[$type][$key]
            : (is_null($default) ? '' : $default);
    }

    /**
     * @param $env
     * @return bool
     */
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
        return ($this->bundle === $bundle);
    }

    /**
     * @return null
     */
    public function getBundle()
    {
        return $this->bundle;
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
     * @param $string
     * @return bool
     */
    public function routeStartsWith($string)
    {
        return (strncmp($this->route, $string, strlen($string)) === 0);
    }

    /**
     * @param $string
     * @return bool
     */
    public function bundleStartsWith($string)
    {
        return (strncmp($this->bundle, $string, strlen($string)) === 0);
    }

    /**
     * @param $regex
     * @param $string
     * @return string
     */
    private function parse($regex, $string)
    {
        $matches = [];

        preg_match($regex, $string, $matches);

        return isset($matches[1]) ? strtolower($matches[1]) : '';
    }
}
