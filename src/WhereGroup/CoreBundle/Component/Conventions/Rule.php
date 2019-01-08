<?php

namespace WhereGroup\CoreBundle\Component\Conventions;

use Symfony\Component\Finder\SplFileInfo;

/**
 * Class Rule
 * @package WhereGroup\CoreBundle\Component\Conventions
 */
class Rule implements RuleInterface
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
     * @param string $lineString
     * @return mixed|void
     */
    public function scanCode(SplFileInfo $file, string $lineString) : bool
    {
    }

    /**
     * @param SplFileInfo $file
     * @return bool
     */
    public function checkExtension(SplFileInfo $file) : bool
    {
        return in_array($file->getExtension(), $this->fileExtensions);
    }
}
