<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Twig_Extension;
use Twig_SimpleFilter;

/**
 * Class TeaserExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class TeaserExtension extends Twig_Extension
{
    /**
     * @return array
     */
    public function getFilters()
    {
        return [
            new Twig_SimpleFilter('teaser', [$this, 'teaser']),
            new Twig_SimpleFilter('groupname', [$this, 'groupName'])
        ];
    }

    /**
     * @param $string
     * @param int $maxLen
     * @param bool $force
     * @return string
     */
    public function teaser($string, $maxLen = 100, $force = false)
    {
        $teaser = '';
        $count  = 0;

        if ($force) {
            $teaser = substr($string, 0, $maxLen);

            return $teaser . (strlen($string) === strlen($teaser) ? '' : ' ...');
        }

        $words  = explode(' ', $string);

        foreach ($words as $word) {
            $count += strlen($word);

            if ($count >= $maxLen) {
                $teaser .= ' ...';
                break;
            }

            $teaser .= ' '. $word;
        }

        return trim($teaser);
    }

    /**
     * @param $string
     * @return mixed
     */
    public function groupName($string)
    {
        $result = "";
        $string = str_replace('ROLE_', '', $string);
        $string = str_replace('SYSTEM_', '', $string);
        $string = str_replace('_', ' ', $string);

        foreach (explode(" ", $string) as $word) {
            $result .= " " . ucfirst(strtolower($word));
        }

        return trim($result);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_teaser";
    }
}
