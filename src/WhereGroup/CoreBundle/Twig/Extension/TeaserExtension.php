<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

/**
 * Class TeaserExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class TeaserExtension extends \Twig_Extension
{
    /**
     * @return array
     */
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('teaser', array($this, 'teaser'))
        );
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'teaser';
    }

    /**
     * @param $string
     * @param int $maxLen
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
}
