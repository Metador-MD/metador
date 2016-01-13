<?php
namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\HttpFoundation\Request;

class MetadorExtension extends \Twig_Extension
{
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('md_select', array($this, 'isSelected'))
        );
    }

    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('md_id', array($this, 'getId'), array('is_safe' => array('html'))),
            new \Twig_SimpleFilter('md_obj_id', array($this, 'getObjectId'), array('is_safe' => array('html'))),
            new \Twig_SimpleFilter('md_data_obj', array($this, 'getDataObject'), array('is_safe' => array('html'))),
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

    public function isSelected($value, $option)
    {
        return $value == $option ? 'selected="selected"' : '';
    }
}
