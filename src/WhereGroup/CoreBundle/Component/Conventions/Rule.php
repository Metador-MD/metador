<?php

namespace WhereGroup\CoreBundle\Component\Conventions;

use Symfony\Component\Finder\SplFileInfo;

/**
 * Class Rule
 * @package WhereGroup\CoreBundle\Component\Conventions
 */
abstract class Rule implements RuleInterface
{
    protected $fileExtensions = ['php'];
    protected $message = '';

    /**
     * @return string
     */
    public function getMessage(): string
    {
        return $this->message;
    }

    /**
     * @param SplFileInfo $file
     * @param Result $result
     * @return mixed|void
     */
    public function scanMetadata(SplFileInfo $file, Result $result)
    {
    }

    /**
     * @param SplFileInfo $file
     * @param Result $result
     * @param $lineString
     * @param $fileHash
     * @param $lineNumber
     * @return mixed|void
     */
    public function scanCode(SplFileInfo $file, Result $result, $lineString, $fileHash, $lineNumber)
    {
    }
}
