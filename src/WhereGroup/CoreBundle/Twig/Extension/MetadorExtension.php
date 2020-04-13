<?php
namespace WhereGroup\CoreBundle\Twig\Extension;

use Twig_Extension;
use Twig_SimpleFilter;
use Twig_SimpleFunction;

/**
 * Class MetadorExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class MetadorExtension extends Twig_Extension
{
    /**
     * @return array
     */
    public function getFunctions()
    {
        return [
            new Twig_SimpleFunction('md_select', [$this, 'isSelected']),
        ];
    }

    /**
     * @return array
     */
    public function getFilters()
    {
        return [
            new Twig_SimpleFilter('md_id', [$this, 'getId'], ['is_safe' => ['html']]),
            new Twig_SimpleFilter('md_obj_id', [$this, 'getObjectId'], ['is_safe' => ['html']]),
            new Twig_SimpleFilter('md_data_obj', [$this, 'getDataObject'], ['is_safe' => ['html']]),
            new Twig_SimpleFilter('md_boolean', [$this, 'booleanFilter']),
            new Twig_SimpleFilter('md_array_path', [$this, 'arrayPath']),
            new Twig_SimpleFilter('md_first_key', [$this, 'firstKey']),
        ];
    }

    /**
     * @param $string
     * @return string
     */
    public function getId($string)
    {
        $string = str_replace(['[', ']'], ['_','_'], strtolower($string));
        $string = str_replace("__", "_", $string);
        return ltrim(rtrim($string, "_"), "_");
    }

    /**
     * @param $string
     * @return string
     */
    public function firstKey($string)
    {
        preg_match('/p\[([^\]]+)\].*/s', $string, $match);
        return isset($match[1]) ? $match[1] : '';
    }

    /**
     * @param $string
     * @return string
     */
    public function getObjectId($string)
    {
        $string = preg_replace("/\[[\d]{1,2}\]/", "", strtolower($string));
        $string = str_replace(['[', ']'], ['_','_'], $string);
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

        $string = str_replace([']['], ':', $match[1]);

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
