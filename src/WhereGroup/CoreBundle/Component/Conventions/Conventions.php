<?php

namespace WhereGroup\CoreBundle\Component\Conventions;

use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Finder\Finder as SymfonyFinder;
use Symfony\Component\Finder\SplFileInfo;

/**
 * Class Finder
 * @package WhereGroup\CoreBundle\Component\Conventions
 */
class Conventions
{
    private $path;
    private $result;
    private $filePattern = '*.php';
    private $scanner = [];

    /**
     * Finder constructor.
     * @param $path
     * @param array $metadataScanner
     * @param array $codeScanner
     */
    public function __construct($path, $metadataScanner = [], $codeScanner = [])
    {
        $this->path = $path;
        $this->result = new Result();
        $this->scanner = [
            'metadata' => $metadataScanner,
            'code'     => $codeScanner
        ];

        // Load default scanner
        foreach (['Metadata', 'Code'] as $scannerType) {
            $finder = new SymfonyFinder();
            $finder->files()->name('*.php')->in(__DIR__ . '/Ruleset/' . $scannerType);

            $scanner = [];

            foreach ($finder as $file) {
                $scanner[] = __NAMESPACE__ . '\\Ruleset\\' . $scannerType . '\\'
                    . pathinfo($file->getFilename(), PATHINFO_FILENAME);

            }

            $this->scanner[strtolower($scannerType)] = array_merge($this->scanner[strtolower($scannerType)], $scanner);
        }
    }

    /**
     * @return Conventions
     */
    public function scan() : Conventions
    {
        $fileCount = 0;
        $finder = new SymfonyFinder();
        $finder->files()->name($this->filePattern)->in($this->path);

        foreach ($finder as $file) {
            if (!$file->isFile()) {
                continue;
            }

            ++$fileCount;

            $this->collectMetadata($file);
        }

        // Run metadata scanner
        foreach ($this->scanner['metadata'] as $class) {
            /** @var RuleInterface $scanner */
            $scanner = new $class;
            $scanner->scanMetadata($this->result);
            unset($scanner);
        }

        return $this;
    }

    /**
     * @param SplFileInfo $file
     * @return Conventions
     */
    public function collectMetadata(SplFileInfo $file): Conventions
    {
        $hash = md5($file->getRelativePathname());
        $this->result->data['files'][$hash] = [
            'path'         => $file->getRealPath(),
            'relativePath' => $file->getRelativePathname(),
            'name'         => $file->getFilename(),
            'extension'    => $file->getExtension()
        ];

        foreach (explode("\n", $file->getContents()) as $number => $line) {
            $line = trim($line);

            if (preg_match('/[ ]*use[ ]+.+;/', $line)) {
                $this->result->data['use'][trim(substr($line, 4))][$hash] = $number;
            }

            // Run code scanner
            foreach ($this->scanner['code'] as $class) {
                /** @var RuleInterface $scanner */
                $scanner = new $class;
                $scanner->scanCode($this->result, $line, $hash, $number);
                unset($scanner);
            }
        }
        return $this;
    }

    /**
     * @param SymfonyStyle $io
     * @return Conventions
     */
    public function showErrors(SymfonyStyle $io) : Conventions
    {
        foreach ($this->result->getErrors() as $class => $result) {
            $rows = [];

            /** @var RuleInterface $scanner */
            $scanner = new $class;
            $io->note($scanner->getMessage());
            unset($scanner);

            foreach ($result['files'] as $hash => $line) {
                $rows[] = [$this->result->getRelativePath($hash), $line];
            }

            $io->table(['File', 'Line'], $rows);
        }

        return $this;
    }

    /**
     * @return bool
     */
    public function hasError() : bool
    {
        return $this->result->hasError();
    }
}
