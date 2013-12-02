<?php
namespace WhereGroup\MetadorBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

class MetadorExtension extends \Twig_Extension
{
    public function __construct(ContainerInterface $container)
    {
        if ($container->isScopeActive('request')) {
        }
        
    }

    public function getFunctions() {
        return array(
            'md_select' => new \Twig_Function_Method($this, 'isSelected'),
        );
    }

    public function getFilters()
    {
        return array(
            'md_id' => new \Twig_Filter_Method($this, 'getId', array('is_safe' => array('html'))),
            'md_obj_id' => new \Twig_Filter_Method($this, 'getObjectId', array('is_safe' => array('html'))),
            'md_data_obj' => new \Twig_Filter_Method($this, 'getDataObject', array('is_safe' => array('html'))),  
        );
    }

    public function getName()
    {
        return 'metador_extension';
    }


    public function getId($string)
    {
        $string = str_replace(array('[', ']'), array('_','_'), strtolower($string));
        $string = str_replace("__", "_", $string);
        return ltrim(rtrim($string, "_"), "_");
    }

    public function getObjectId($string)
    {
        $string = preg_replace("/\[[\d]{1,2}\]/", "", strtolower($string));
        $string = str_replace(array('[', ']'), array('_','_'), $string);
        $string = str_replace("__", "_", $string);
        return ltrim(rtrim($string, "_"), "_");
    }

    public function getDataObject($string)
    {
        $string = preg_replace("/\[[\d]{1,2}\]/", "", strtolower($string));
        $string = str_replace(array('[', ']'), array('_','_'), $string);
        $string = str_replace("__", "_", $string);
        return 'data-obj-id="' . rtrim($string, "_") . '"';
    }

    public function isSelected($value, $option) {
        return $value == $option ? 'selected="selected"' : '';
    }
}
