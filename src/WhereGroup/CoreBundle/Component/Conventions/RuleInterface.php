<?php

namespace WhereGroup\CoreBundle\Component\Conventions;

use Symfony\Component\Finder\SplFileInfo;

/**
 * Interface RuleInterface
 * @package WhereGroup\CoreBundle\Component\Conventions
 */
interface RuleInterface
{
    /**
     * @return string
     */
    public function getMessage() : string;

    /**
     * @param SplFileInfo $file
     * @param string $lineString
     * @return bool
     */
    public function scanCode(SplFileInfo $file, string $lineString) : bool;

    /**
     * @param SplFileInfo $file
     * @return bool
     */
    public function checkExtension(SplFileInfo $file) : bool;
}
