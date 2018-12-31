<?php

namespace WhereGroup\CoreBundle\Component\Conventions\Ruleset\Code;

use Symfony\Component\Finder\SplFileInfo;
use WhereGroup\CoreBundle\Component\Conventions\Result;
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
     * @param Result $result
     * @param $lineString
     * @param $fileHash
     * @param $lineNumber
     */
    public function scanCode(SplFileInfo $file, Result $result, $lineString, $fileHash, $lineNumber)
    {
        if (!in_array($file->getExtension(), $this->fileExtensions)) {
            return;
        }

        if (preg_match('/[^_]array\(/', $lineString)) {
            $result->addError(self::class, $fileHash, $lineNumber);
        }
    }
}
