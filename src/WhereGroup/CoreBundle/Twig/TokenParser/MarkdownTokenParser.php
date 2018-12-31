<?php

namespace WhereGroup\CoreBundle\Twig\TokenParser;

use WhereGroup\CoreBundle\Twig\Node\MarkdownNode;

/**
 * Class MarkdownTokenParser
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class MarkdownTokenParser extends \Twig_TokenParser
{
    /**
     * @param \Twig_Token $token
     * @return \Twig_NodeInterface|MarkdownNode
     * @throws \Twig_Error_Syntax
     */
    public function parse(\Twig_Token $token)
    {
        $lineno = $token->getLine();
        $stream = $this->parser->getStream();

        // recovers all inline parameters close to your tag name
        $params = array_merge([], $this->getInlineParams($token));

        $continue = true;
        while ($continue) {
            $body = $this->parser->subparse([$this, 'decideMarkdownFork']);
            $tag = $stream->next()->getValue();

            switch ($tag) {
                case 'endmarkdown':
                    $continue = false;
                    break;
                default:
                    throw new \Twig_Error_Syntax('Endtag for endmarkdown not found');
            }

            array_unshift($params, $body);
            $stream->expect(\Twig_Token::BLOCK_END_TYPE);
        }

        return new MarkdownNode(new \Twig_Node($params), $lineno, $this->getTag());
    }

    /**
     * Recovers all tag parameters until we find a BLOCK_END_TYPE ( %} )
     *
     * @param \Twig_Token $token
     * @return array
     * @throws \Twig_Error_Syntax
     */
    protected function getInlineParams(\Twig_Token $token)
    {
        $stream = $this->parser->getStream();
        $params = [];
        while (!$stream->test(\Twig_Token::BLOCK_END_TYPE)) {
            $params[] = $this->parser->getExpressionParser()->parseExpression();
        }
        $stream->expect(\Twig_Token::BLOCK_END_TYPE);
        return $params;
    }

    /**
     * Callback called at each tag name when subparsing, must return
     * true when the expected end tag is reached.
     *
     * @param \Twig_Token $token
     * @return bool
     */
    public function decideMarkdownFork(\Twig_Token $token)
    {
        return $token->test(['endmarkdown']);
    }

    /**
     * Your tag name: if the parsed tag match the one you put here, your parse()
     * method will be called.
     *
     * @return string
     */
    public function getTag()
    {
        return 'markdown';
    }
}
