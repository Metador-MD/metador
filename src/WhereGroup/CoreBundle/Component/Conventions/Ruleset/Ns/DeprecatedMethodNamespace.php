<?php

namespace WhereGroup\CoreBundle\Component\Conventions\Ruleset\Ns;

use Symfony\Component\Finder\SplFileInfo;
use WhereGroup\CoreBundle\Component\Conventions\Result;
use WhereGroup\CoreBundle\Component\Conventions\Rule;

/**
 * Class DeprecatedNamespace
 * @package WhereGroup\CoreBundle\Component\Conventions\Rulesets
 */
class DeprecatedMethodNamespace extends Rule
{
    protected $message = 'Namespace "Sensio\Bundle\FrameworkExtraBundle\Configuration\Method" is deprecated, 
    use "Symfony\Component\Routing\Annotation\Route" instead!';

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

        if (preg_match('/Sensio\\\Bundle\\\FrameworkExtraBundle\\\Configuration\\\Method/', $lineString)) {
            $result->addError(self::class, $fileHash, $lineNumber);
        }
    }
}
