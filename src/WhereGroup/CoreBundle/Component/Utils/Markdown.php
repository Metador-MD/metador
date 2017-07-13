<?php

namespace WhereGroup\CoreBundle\Component\Utils;

/**
 * Class Markdown
 * @package WhereGroup\CoreBundle\Component
 */
class Markdown
{
    private $parser;

    /**
     * Markdown constructor.
     */
    public function __construct()
    {
        $this->parser = new \Parsedown();
    }

    /**
     * @param $text
     * @return string
     */
    public function toHtml($text)
    {
        $html = $this->parser->text($text);

        return $html;
    }
}
