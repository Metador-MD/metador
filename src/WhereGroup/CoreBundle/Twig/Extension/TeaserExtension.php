<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;

class TeaserExtension extends \Twig_Extension
{
    public function getFilters()
    {
        return array(
            'teaser' => new \Twig_Filter_Method($this, 'teaser')
        );
    }

    public function getName()
    {
        return 'teaser';
    }


    public function teaser($string, $maxLen = 100)
    {
        $teaser = '';
        $count  = 0;
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
