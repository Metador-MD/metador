<?php
namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

class ControllerInfoExtension extends \Twig_Extension
{
    protected $name;
    protected $action;

    public function __construct(ContainerInterface $container)
    {
        if ($container->isScopeActive('request')) {
            $controller = $container->get('request')->get('_controller');

            $matches = array();
            
            preg_match("/Controller\\\([\w]*)Controller/i", $controller, $matches);
            $this->name = isset($matches[1]) ? strtolower($matches[1]) : '';

            preg_match("/\:([\w]*)Action/i", $controller, $matches);
            $this->action = isset($matches[1]) ? strtolower($matches[1]) : '';
        }
        
    }

    public function getFunctions()
    {
        return array(
            'controller_name' => new \Twig_Function_Method($this, 'getControllerName'),
            'controller_action' => new \Twig_Function_Method($this, 'getControllerAction')
        );
    }

    public function getName()
    {
        return 'controller_info_extension';
    }


    public function getControllerName()
    {
        return $this->name;
    }

    public function getControllerAction()
    {
        return $this->action;
    }
}
