<?php

namespace WhereGroup\CoreBundle\Component\Conventions\Ruleset\Annotation;

use Symfony\Component\Finder\SplFileInfo;
use WhereGroup\CoreBundle\Component\Conventions\Result;
use WhereGroup\CoreBundle\Component\Conventions\Rule;

/**
 * Class DisallowTemplateAnnotation
 * @package WhereGroup\CoreBundle\Component\Conventions\Rulesets
 */
class DisallowTemplateAnnotation extends Rule
{
    protected $message = 'Dont use @Template() Annotation, use $this->render(); instead!';

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

        if (preg_match('/@Template\(/', $lineString)) {
            $result->addError(self::class, $fileHash, $lineNumber);
        }
    }
}
