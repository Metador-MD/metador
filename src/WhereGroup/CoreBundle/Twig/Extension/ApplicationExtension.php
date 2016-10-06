<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Component\Application;

/**
 * Class ApplicationExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class ApplicationExtension extends \Twig_Extension
{
    private $application;

    /**
     * ApplicationExtension constructor.
     * @param Application $application
     */
    public function __construct(Application $application)
    {
        $this->application = $application;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('applicationGet', array($this, 'applicationGet'))
        );
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'application_extension';
    }

    /**
     * @param $type
     * @param null $key
     * @param null $default
     * @return mixed
     */
    public function applicationGet($type, $key = null, $default = null)
    {
        return $this->application->getData($type, $key, $default);
    }
}
