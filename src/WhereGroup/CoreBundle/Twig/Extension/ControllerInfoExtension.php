<?php
namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Class ControllerInfoExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class ControllerInfoExtension extends \Twig_Extension
{
    private $name         = null;
    private $action       = null;
    private $requestStack = null;

    /**
     * ControllerInfoExtension constructor.
     * @param RequestStack $requestStack
     */
    public function __construct(RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('controller_name', array($this, 'getControllerName')),
            new \Twig_SimpleFunction('controller_action', array($this, 'getControllerAction'))
        );
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'controller_info_extension';
    }

    /**
     * @return null
     */
    public function getControllerName()
    {
        $this->updateInformation();
        return $this->name;
    }

    /**
     * @return null
     */
    public function getControllerAction()
    {
        $this->updateInformation();
        return $this->action;
    }

    private function updateInformation()
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
}
