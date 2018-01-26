<?php
namespace WhereGroup\CoreBundle\Twig\Extension;

/**
 * Class MetadorExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class MetadorExtension extends \Twig_Extension
{
    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('md_select', array($this, 'isSelected')),
        );
    }

    /**
     * @return array
     */
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('md_id', array($this, 'getId'), array('is_safe' => array('html'))),
            new \Twig_SimpleFilter('md_obj_id', array($this, 'getObjectId'), array('is_safe' => array('html'))),
            new \Twig_SimpleFilter('md_data_obj', array($this, 'getDataObject'), array('is_safe' => array('html'))),
            new \Twig_SimpleFilter('md_boolean', array($this, 'booleanFilter')),
            new \Twig_SimpleFilter('md_array_path', array($this, 'arrayPath')),
        );
    }

    /**
     * @param $string
     * @return string
     */
    public function getId($string)
    {
        $string = str_replace(array('[', ']'), array('_','_'), strtolower($string));
        $string = str_replace("__", "_", $string);
        return ltrim(rtrim($string, "_"), "_");
    }

    /**
     * @param $string
     * @return string
     */
    public function getObjectId($string)
    {
        $string = preg_replace("/\[[\d]{1,2}\]/", "", strtolower($string));
        $string = str_replace(array('[', ']'), array('_','_'), $string);
        $string = str_replace("__", "_", $string);
        return trim($string, "\t\n\r_");
    }

    /**
     * @param $string
     * @return string
     */
    public function getDataObject($string)
    {
        return 'data-obj-id="' . $this->getObjectId($string) . '"';
    }

    /**
     * @param $value
     * @return string
     */
    public function booleanFilter($value)
    {
        if ($value === "1" || $value === true || $value === 1) {
            return "Ja";
        }

        return "Nein";
    }

    /**
     * @param $string
     * @return mixed
     */
    public function arrayPath($string)
    {
        preg_match('/^p\[(.+)\]$/', $string, $match);

        if (empty($match[1])) {
            return '';
        }

        $string = str_replace(array(']['), ':', $match[1]);

        return trim($string, ':');
    }

    /**
     * @param $value
     * @param $option
     * @return string
     */
    public function isSelected($value, $option)
    {
        return $value == $option ? 'selected=selected' : '';
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_extension";
    }
}
