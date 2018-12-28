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
     * @param Result $result
     * @return mixed
     */
    public function scanMetadata(SplFileInfo $file, Result $result);

    /**
     * @param SplFileInfo $file
     * @param Result $result
     * @param $lineString
     * @param $fileHash
     * @param $lineNumber
     * @return mixed
     */
    public function scanCode(SplFileInfo $file, Result $result, $lineString, $fileHash, $lineNumber);
}
