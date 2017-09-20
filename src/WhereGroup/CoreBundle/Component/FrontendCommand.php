<?php

namespace WhereGroup\CoreBundle\Component;

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
        $response = $this->runMethod('metador', 'redirect', $url, $response);

        return $this;
    }

    /**
     * @param $response
     * @param $url
     * @return $this
     */
    public function changeLocation(&$response, $url)
    {
        $response = $this->runMethod('metador', 'changeLocation', $url, $response);

        return $this;
    }

    /**
     * @param $response
     * @param $message
     * @param $parameters
     * @return $this
     */
    public function displayInfo(&$response, $message, $parameters = array())
    {
        $response = $this->runMethod(
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
    public function displaySuccess(&$response, $message, $parameters = array())
    {
        $response = $this->runMethod(
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
    public function displayWarning(&$response, $message, $parameters = array())
    {
        $response = $this->runMethod(
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
    public function displayError(&$response, $message, $parameters = array())
    {
        $response = $this->runMethod(
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
     * @return array
     */
    public function runMethod($class, $method, $argument, &$response)
    {
        return array_merge_recursive($response, array(
            'METADOR' => array(
                'runMethod' => array(
                    array(
                        'class'    => $class,
                        'method'   => $method,
                        'argument' => $argument
                    )
                )
            )
        ));
    }

    /**
     * @param $function
     * @param $argument
     * @param $response
     * @return array
     */
    public function runFunction($function, $argument, &$response)
    {
        return array_merge_recursive($response, array(
            'METADOR' => array(
                'runFunction' => array(
                    array(
                        'function' => $function,
                        'argument' => $argument
                    )
                )
            )
        ));
    }
}
