<?php
namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

class GetParameterExtension extends \Twig_Extension
{
    protected $container;

    public function __construct(ContainerInterface $container)
    {
        if ($container->isScopeActive('request')) {
            $this->container = $container;
        }
        
    }

    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('getParameter', array($this, 'getParameter'))
        );
    }

    public function getName()
    {
        return 'get_parameter_extension';
    }


    public function getParameter($parameter)
    {
        return $this->container->getParameter($parameter);
    }
}
