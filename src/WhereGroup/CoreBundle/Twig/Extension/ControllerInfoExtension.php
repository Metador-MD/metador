<?php
namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class ControllerInfoExtension extends \Twig_Extension
{
    private $name         = null;
    private $action       = null;
    private $requestStack = null;

    public function __construct(RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;
    }

    public function updateInformation()
    {
        if (is_null($this->name)) {
            $controller = $this->requestStack->getCurrentRequest()->get('_controller');

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
            new \Twig_SimpleFunction('controller_name', array($this, 'getControllerName')),
            new \Twig_SimpleFunction('controller_action', array($this, 'getControllerAction'))
        );
    }

    public function getName()
    {
        return 'controller_info_extension';
    }

    public function getControllerName()
    {
        $this->updateInformation();
        return $this->name;
    }

    public function getControllerAction()
    {
        $this->updateInformation();
        return $this->action;
    }
}
