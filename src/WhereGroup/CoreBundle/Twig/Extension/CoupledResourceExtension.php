<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

/**
 * Class CoupledResourceExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class CoupledResourceExtension extends \Twig_Extension
{
    private $operatesOnUrl;

    /**
     * CoupledResourceExtension constructor.
     * @param $operatesOnUrl
     */
    public function __construct($operatesOnUrl)
    {
        $this->operatesOnUrl = $operatesOnUrl;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction(
                'generate_operates_on',
                array($this, 'operatesOn'),
                array('is_safe' => array('html'))
            )
        );
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'coupled_resource_extension';
    }

    /**
     * @return string
     */
    public function operatesOn($coupledResource)
    {
        preg_match(
            '/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/',
            $coupledResource,
            $matches
        );

        $href = urlencode($this->operatesOnUrl . (isset($matches[1]) ? $matches[1] : '') . '#' . $coupledResource);

        return "\n" . '<srv:operatesOn xlink:href="' . $href . '" uuidref="' . $coupledResource . '" />';
    }
}
