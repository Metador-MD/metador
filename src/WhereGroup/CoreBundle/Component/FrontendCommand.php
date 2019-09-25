<?php

namespace WhereGroup\CoreBundle\Component;

use WhereGroup\CoreBundle\Component\Utils\ArrayParser;

/**
 * Class FrontendCommand
 * @package WhereGroup\CoreBundle\Component
 */
class FrontendCommand
{
    /** @var  Core */
    private $core;

    /**
     * FrontendCommand constructor.
     * @param Core $core
     */
    public function __construct(Core $core)
    {
        $this->core = $core;
    }

    /**
     * @param $response
     * @param $url
     * @return $this
     */
    public function redirect(&$response, $url)
    {
        $this->runMethod('metador', 'redirect', $url, $response);

        return $this;
    }

    /**
     * @param $response
     * @param $url
     * @return $this
     */
    public function changeLocation(&$response, $url)
    {
        $this->runMethod('metador', 'changeLocation', $url, $response);

        return $this;
    }

    /**
     * @param $response
     * @param $message
     * @param $parameters
     * @return $this
     */
    public function displayInfo(&$response, $message, $parameters = [])
    {
        $this->runMethod(
            'metador',
            'displayInfo',
            $this->core->translate($message, $parameters),
            $response
        );

        return $this;
    }

    /**
     * @param $response
     * @param $message
     * @param $parameters
     * @return $this
     */
    public function displaySuccess(&$response, $message, $parameters = [])
    {
        $this->runMethod(
            'metador',
            'displaySuccess',
            $this->core->translate($message, $parameters),
            $response
        );

        return $this;
    }

    /**
     * @param $response
     * @param $message
     * @param $parameters
     * @return $this
     */
    public function displayWarning(&$response, $message, $parameters = [])
    {
        $this->runMethod(
            'metador',
            'displayWarning',
            $this->core->translate($message, $parameters),
            $response
        );

        return $this;
    }

    /**
     * @param $response
     * @param $message
     * @param $parameters
     * @return $this
     */
    public function displayError(&$response, $message, $parameters = [])
    {
        $this->runMethod(
            'metador',
            'displayError',
            $this->core->translate($message, $parameters),
            $response
        );

        return $this;
    }

    /**
     * @param $class
     * @param $method
     * @param $argument
     * @param $response
     * @return FrontendCommand
     */
    public function runMethod($class, $method, $argument, &$response)
    {
        if (!isset($response['METADOR']['runMethod'])) {
            $response['METADOR']['runMethod'] = [];
        }

        $response['METADOR']['runMethod'][] = [
            'class'    => $class,
            'method'   => $method,
            'argument' => $argument
        ];

        return $this;
    }

    /**
     * @param $function
     * @param $argument
     * @param $response
     * @return FrontendCommand
     */
    public function runFunction($function, $argument, &$response)
    {
        if (!isset($response['METADOR']['runFunction'])) {
            $response['METADOR']['runFunction'] = [];
        }

        $response['METADOR']['runFunction'][] = [
            'function' => $function,
            'argument' => $argument
        ];

        return $this;
    }
}
