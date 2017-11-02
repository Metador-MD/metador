<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use WhereGroup\PluginBundle\Component\ApplicationIntegration as Integration;
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
    private $env                  = null;
    private $requestStack         = null;
    private $authorizationChecker = null;

    const POSITION_PREPEND = 0;
    const POSITION_NORMAL  = 1;
    const POSITION_APPEND  = 2;

    /**
     * Application constructor.
     * @param EventDispatcherInterface $eventDispatcher
     * @param AuthorizationCheckerInterface $authorizationChecker
     * @param RequestStack $requestStack
     * @param $env
     */
    public function __construct(
        EventDispatcherInterface $eventDispatcher,
        AuthorizationCheckerInterface $authorizationChecker,
        RequestStack $requestStack,
        $env
    ) {
        $this->env                  = $env;
        $this->authorizationChecker = $authorizationChecker;
        $this->requestStack         = $requestStack;
        $request = $this->requestStack->getCurrentRequest();

        if ($request && $this->env === 'dev' && $request->attributes->get('_route') === '_wdt') {
            return;
        }

        // dispatch event
        $eventDispatcher->dispatch('application.loading', new ApplicationEvent($this, array()));
    }

    /**
     * @return null|RequestStack
     */
    public function getRequestStack()
    {
        return $this->requestStack;
    }

    private function updateInformation()
    {
        $request = $this->requestStack->getCurrentRequest();

        if (is_null($this->route) && is_object($request)) {
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

    /**
     * @return string
     */
    public function debug()
    {
        $this->updateInformation();

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
        $this->updateInformation();

        return ($this->bundle === $bundle);
    }

    /**
     * @return null
     */
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

    /**
     * @param $string
     * @return bool
     */
    public function routeStartsWith($string)
    {
        $this->updateInformation();

        return (strncmp($this->route, $string, strlen($string)) === 0);
    }

    /**
     * @param $string
     * @return bool
     */
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
