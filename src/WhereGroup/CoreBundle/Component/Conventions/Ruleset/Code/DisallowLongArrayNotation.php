<?php

namespace WhereGroup\CoreBundle\Component\Conventions\Ruleset\Code;

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
     * @param Result $result
     * @param $lineString
     * @param $fileHash
     * @param $lineNumber
     */
    public function scanCode(Result $result, $lineString, $fileHash, $lineNumber)
    {
        if (preg_match('/array\(/', $lineString)) {
            $result->addError(DisallowLongArrayNotation::class, $fileHash, $lineNumber);
        }
    }
}
