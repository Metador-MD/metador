<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Twig_Extension;
use Twig_SimpleFunction;

/**
 * Class CoupledResourceExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class CoupledResourceExtension extends Twig_Extension
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
        return [
            new Twig_SimpleFunction(
                'generate_operates_on',
                [$this, 'operatesOn'],
                ['is_safe' => ['html']]
            )
        ];
    }

    /**
     * @param $uuid
     * @param $coupledResource
     * @return string
     */
    public function operatesOn($uuid, $coupledResource)
    {
        $coupledResource = $coupledResource['codespace'] . $coupledResource['code'];

        return "\n" . '<srv:operatesOn xlink:href="'
            . urlencode($this->operatesOnUrl . $uuid . '#' . $coupledResource)
            . '" uuidref="' . $coupledResource . '" />';
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_coupled_resources";
    }
}
