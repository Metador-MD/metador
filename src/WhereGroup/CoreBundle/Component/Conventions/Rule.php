<?php

namespace WhereGroup\CoreBundle\Component\Conventions;

/**
 * Class Rule
 * @package WhereGroup\CoreBundle\Component\Conventions
 */
abstract class Rule implements RuleInterface
{
    protected $message = '';

    /**
     * @return string
     */
    public function getMessage(): string
    {
        return $this->message;
    }

    public function scanMetadata(Result $result)
    {
    }

    public function scanCode(Result $result, $lineString, $fileHash, $lineNumber)
    {
    }
}
