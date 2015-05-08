<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class Wizard
 * @package WhereGroup\CoreBundle\Component
 * @author A. R. Pour
 */
class Wizard
{
    protected $container;

    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * @param $hierarchyLevel
     * @return array
     */
    public function getExamples($path)
    {
        $examples = array();

        foreach (scandir($path) as $file) {
            // echo "<br/>" . $path . $file;

            if ($file !== '.' && $file !== '..' && is_dir($path . $file)) {
                $array = array();

                foreach (scandir($path . $file) as $subFile) {
                    if (substr($subFile, -5) != ".json") {
                        continue;
                    }

                    $array = array_merge($array, json_decode(file_get_contents($path . $file . '/' . $subFile), true));
                }

                $examples[$file] = $array;

                continue;
            } elseif (substr($file, -5) != ".json") {
                continue;
            }

            $examples[substr($file, 0, -5)]
                = json_decode(file_get_contents($path . $file), true);
        }

        return $examples;
    }
}
