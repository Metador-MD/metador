<?php

namespace WhereGroup\CoreBundle\Component\Conventions;

/**
 * Class FinderResult
 * @package WhereGroup\CoreBundle\Component\Conventions
 */
class Result
{
    /**
     * @var int
     */
    private $files = 0;

    public $data = [
        'files'  => [],
        'errors' => [],
        'metadata' => [
            'use' => []
        ]
    ];

    /**
     * @return int
     */
    public function getFiles(): int
    {
        return $this->files;
    }

    /**
     * @param int $files
     * @return Result
     */
    public function setFiles(int $files): Result
    {
        $this->files = $files;
        return $this;
    }

    /**
     * @return array
     */
    public function getData(): array
    {
        return $this->data;
    }

    /**
     * @param $testClass
     * @param $hash
     * @param $line
     * @param null $message
     */
    public function addError($testClass, $hash, $line, $message = null)
    {
        $this->data['errors'][$testClass]['message'] = $message;

        if (!empty($this->data['errors'][$testClass]['files'][$hash])) {
            $this->data['errors'][$testClass]['files'][$hash]
                = $this->data['errors'][$testClass]['files'][$hash] . ',' . $line;

            return;
        }

        $this->data['errors'][$testClass]['files'][$hash] = $line;
    }

    /**
     * @return mixed
     */
    public function getErrors()
    {
        return $this->data['errors'];
    }

    /**
     * @return bool
     */
    public function hasError() : bool
    {
        if (!empty($this->data['errors'])) {
            return true;
        }

        return false;
    }

    /**
     * @param string $hash
     * @return string|null
     */
    public function getRelativePath(string $hash)
    {
        if (!isset($this->data['files'][$hash])) {
            return null;
        }

        return $this->data['files'][$hash]['relativePath'];
    }
}
