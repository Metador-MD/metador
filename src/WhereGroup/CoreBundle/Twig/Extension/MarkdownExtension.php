<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use WhereGroup\CoreBundle\Component\Utils\Markdown;

/**
 * Class MarkdownExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class MarkdownExtension extends \Twig_Extension
{
    private $parser;

    /**
     * MarkdownExtension constructor.
     * @param Markdown $parser
     */
    public function __construct(Markdown $parser)
    {
        $this->parser = $parser;
    }

    /**
     * @return array
     */
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter(
                'md2html',
                array($this, 'markdownToHtml'),
                array('is_safe' => array('html'), 'pre_escape' => 'html')
            ),
        );
    }

    /**
     * @param $content
     * @return string
     */
    public function markdownToHtml($content)
    {
        return $this->parser->toHtml($content);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'markdown_extension';
    }
}
