<?php

namespace WhereGroup\CoreBundle\Component\Conventions;

use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Finder\Finder as SymfonyFinder;

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
    private $exclude = [];

    /**
     * Finder constructor.
     * @param $path
     */
    public function __construct($path)
    {
        $this->path = $path;
        $this->result = new Result();
        $this->exclude = [
            'WhereGroup/CoreBundle/Component/Conventions'
        ];

        $this->loadDefaultScanner();
    }

    /**
     * @param $path
     */
    public function excludePath($path)
    {
        if (!in_array($path, $this->exclude)) {
            $this->exclude[] = $path;
        }
    }

    public function loadDefaultScanner()
    {
        foreach (['Annotation', 'Code', 'Ns'] as $scannerType) {
            $finder = new SymfonyFinder();
            $finder->files()->name('*.php')->in(__DIR__ . '/Ruleset/' . $scannerType);

            foreach ($finder as $file) {
                $this->scanner[] = __NAMESPACE__ . '\\Ruleset\\' . $scannerType . '\\'
                    . pathinfo($file->getFilename(), PATHINFO_FILENAME);

            }
        }
    }

    /**
     * @return Conventions
     */
    public function scan() : Conventions
    {
        $fileCount = 0;
        $finder = new SymfonyFinder();
        $finder->files()->name($this->filePattern)->in($this->path)->exclude($this->exclude);

        foreach ($finder as $file) {
            if (!$file->isFile()) {
                continue;
            }

            ++$fileCount;

            $hash = md5($file->getRelativePathname());
            $this->result->data['files'][$hash] = [
                'path'         => $file->getRealPath(),
                'relativePath' => $file->getRelativePathname(),
                'name'         => $file->getFilename(),
                'extension'    => $file->getExtension()
            ];

            foreach (explode("\n", $file->getContents()) as $number => $line) {
                // Run code scanner
                foreach ($this->scanner as $class) {
                    /** @var RuleInterface $scanner */
                    $scanner = new $class;
                    $scanner->scanCode($file, $this->result, trim($line), $hash, ++$number);
                    unset($scanner);
                }
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
