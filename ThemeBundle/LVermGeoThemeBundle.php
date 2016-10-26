<?php

namespace Plugins\LVermGeo\ThemeBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

/**
 * Class LVermGeoThemeBundle
 * @package Plugins\LVermGeo\ThemeBundle
 */
class LVermGeoThemeBundle extends Bundle
{
    /**
     * @return string
     */
    public function getParent()
    {
        return 'MetadorThemeBundle';
    }
}
