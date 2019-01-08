<?php

namespace WhereGroup\CoreBundle\Component\Conventions\Ruleset\Code;

use Symfony\Component\Finder\SplFileInfo;
use WhereGroup\CoreBundle\Component\Conventions\Rule;

/**
 * Class DisallowLongArrayNotation
 * @package WhereGroup\CoreBundle\Component\Conventions\Rulesets
 */
class DisallowLongArrayNotation extends Rule
{
    protected $message = 'Dont use array(), use [] instead!';

    /**
     * @param SplFileInfo $file
     * @param $lineString
     * @return bool
     */
    public function scanCode(SplFileInfo $file, string $lineString) : bool
    {
        if ($this->checkExtension($file) && preg_match('/[^_]array\(/', $lineString)) {
            return true;
        }

        return false;
    }
}
