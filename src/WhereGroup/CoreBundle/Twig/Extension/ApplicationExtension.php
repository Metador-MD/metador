<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ApplicationExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class ApplicationExtension extends \Twig_Extension
{
    protected $container;

    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        if ($container->isScopeActive('request')) {
            $this->container = $container;
        }
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            'applicationGet' => new \Twig_Function_Method($this, 'applicationGet')
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
     * @return mixed
     */
    public function applicationGet($type, $key = null, $default = null)
    {
        return $this->container
            ->get('metador.application')
            ->get($type, $key, $default);
    }
}
