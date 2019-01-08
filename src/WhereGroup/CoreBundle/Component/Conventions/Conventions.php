<?php

namespace WhereGroup\CoreBundle\Component\Conventions;

use Symfony\Component\Filesystem\Filesystem;
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
    private $ignore = [];
    private $file;

    /**
     * Finder constructor.
     * @param string $path
     * @param array $ignore
     */
    public function __construct(string $path, array $ignore = [])
    {
        $this->path = $path;
        $this->result = new Result();
        $this->ignore = $ignore;
        $this->exclude = ['WhereGroup/CoreBundle/Component/Conventions'];
        $this->file = __DIR__ . '/../../Resources/config/ruleset.json';
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
        $ruleset = new SymfonyFinder();
        $ruleset->directories()->in(__DIR__ . '/Ruleset/');

        foreach ($ruleset as $folder) {
            $finder = new SymfonyFinder();
            $finder->files()->name('*.php')->in(__DIR__ . '/Ruleset/' . $folder->getFilename());

            foreach ($finder as $file) {
                $filename = pathinfo($file->getFilename(), PATHINFO_FILENAME);

                if (in_array($filename, $this->ignore)) {
                    continue;
                }

                $this->scanner[] = __NAMESPACE__ . '\\Ruleset\\' . $folder->getFilename() . '\\' . $filename;
            }
        }
    }

    /**
     * @return Conventions
     */
    public function scan() : Conventions
    {
        $rules = [];
        $fs = new Filesystem();
        if ($fs->exists($this->file) && is_readable($this->file)) {
            $rules = json_decode(file_get_contents($this->file), true);
        };

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
                ++$number;

                // Run code scanner
                foreach ($this->scanner as $class) {
                    /** @var RuleInterface $scanner */
                    $scanner = new $class;

                    if ($scanner->scanCode($file, trim($line))) {
                        $this->result->addError($class, $hash, $number);
                    }

                    unset($scanner);
                }

                // Run regexp rules from ruleset.json
                foreach ($rules as $key => $rule) {
                    if (in_array($key, $this->ignore)) {
                        continue;
                    }

                    if (!isset($rule['extensions']) || !is_array($rule['extensions'])) {
                        $rule['extensions'] = ['php'];
                    }

                    if (in_array($file->getExtension(), $rule['extensions']) && preg_match($rule['regexp'], $line)) {
                        $this->result->addError($key, $hash, $number, $rule['message']);
                    }
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

            if (!isset($result['message']) || is_null($result['message'])) {
                /** @var RuleInterface $scanner */
                $scanner = new $class;
                $io->note($scanner->getMessage());
                unset($scanner);
            } else {
                $io->note($result['message']);
            }

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
