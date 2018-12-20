<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use WhereGroup\CoreBundle\Component\Utils\Markdown;
use WhereGroup\CoreBundle\Twig\TokenParser\MarkdownTokenParser;

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
        return [
            new \Twig_SimpleFilter(
                'markdown',
                [$this, 'markdownToHtml'],
                ['is_safe' => ['html'], 'pre_escape' => 'html']
            ),
        ];
    }

    /**
     * @return array|\Twig_TokenParserInterface[]
     */
    public function getTokenParsers()
    {
        return [
            new MarkdownTokenParser()
        ];
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
        return 'markdown';
    }
}
