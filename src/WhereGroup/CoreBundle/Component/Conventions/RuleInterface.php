<?php

namespace WhereGroup\CoreBundle\Component\Conventions;

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
     * @param Result $result
     * @return mixed
     */
    public function scanMetadata(Result $result);

    /**
     * @param Result $result
     * @param $lineString
     * @param $fileHash
     * @param $lineNumber
     * @return mixed
     */
    public function scanCode(Result $result, $lineString, $fileHash, $lineNumber);
}
