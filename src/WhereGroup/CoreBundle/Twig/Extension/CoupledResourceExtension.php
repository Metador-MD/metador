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
    public function operatesOn($uuid, $coupledResource)
    {
        $coupledResource = $coupledResource['codespace'] . $coupledResource['code'];

        return "\n" . '<srv:operatesOn xlink:href="'
            . urlencode($this->operatesOnUrl . $uuid . '#' . $coupledResource)
            . '" uuidref="' . $coupledResource . '" />';
    }
}
