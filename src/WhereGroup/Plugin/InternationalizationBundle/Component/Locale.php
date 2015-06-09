<?php

namespace WhereGroup\Plugin\InternationalizationBundle\Component;

use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Yaml\Yaml;

use WhereGroup\PluginBundle\Component\Plugin;

/**
 * Class Locale
 * @package WhereGroup\Plugin\InternationalizationBundle\Component
 * @author A.R.Pour
 */
class Locale
{
    protected $kernel;
    protected $plugin;
    protected $locales;
    protected $bundles;
    protected $domains;
    protected $import;

    public function __construct(KernelInterface $kernel, Plugin $plugin, $locales, $bundles, $import)
    {
        $this->kernel  = $kernel;
        $this->plugin  = $plugin;
        $this->locales = $locales;
        $this->bundles = $bundles;
        $this->import  = $import;
        $this->domains = array(
            'messages'
        );
    }

    public function __destruct()
    {
        unset($this->kernel);
        unset($this->plugin);
    }

    public function getBundles($onlyActive = true)
    {
        $bundles = array();

        // Read translation for configured bundles.
        if (is_array($this->bundles)) {
            $bundles = array_merge($bundles, $this->bundles);
        }

        // Read translation for active plugins.
        foreach ($this->plugin->getPlugins() as $plugin) {
            if ($plugin['active']) {
                $bundles[] = $plugin['class_name'];
            }
        }

        return $bundles;
    }

    public function getTranslations($domain, $locale, $currentBundle)
    {
        if (!in_array($locale, $this->locales) || !in_array($domain, $this->domains)) {
            throw new \Exception("Sprache ($locale) oder Domain ($domain) nicht bekannt.", 1);
        }

        $translations = array( 'current' => array(), 'all' => array() );

        foreach ($this->getBundles() as $bundle) {
            $folder = $this->getTranslationsFolder($bundle);

            // No translation found
            if (!$folder) {
                continue;
            }

            $finder = new Finder();
            $finder->files()->in($folder)->name($domain . '.' . $locale . '.yml');

            foreach ($finder as $file) {
                $temp = Yaml::parse(file_get_contents($file->getRealpath()));

                // Translation file emtpy or corrupt
                if (!is_array($temp) || empty($temp)) {
                    continue;
                }

                if ($bundle == $currentBundle) {
                    $translations['current'] = $temp;
                } else {
                    foreach ($temp as $key => $value) {
                        if (substr($value, 0, 2) !== '__') {
                            $translations['all'][$key] = $value;
                        }
                    }
                }
            }
        }

        if (!empty($locale) && isset($this->import[$locale])) {
            if (is_array($this->import[$locale])) {
                foreach ($this->import[$locale] as $filepath) {
                    $temp = Yaml::parse(file_get_contents($filepath));
                    $translations['all'] = array_merge($translations['all'], $temp);
                }
            } elseif (is_string($this->import[$locale]) && file_exists($this->import[$locale])) {
                $temp = Yaml::parse(file_get_contents($this->import[$locale]));
                $translations['all'] = array_merge($translations['all'], $temp);
            }
        }

        ksort($translations['current']);

        return $translations;
    }

    public function setTranslations($domain, $locale, $bundle, $key, $translation)
    {
        if (!in_array($locale, $this->locales) || !in_array($domain, $this->domains)) {
            throw new \Exception("Sprache ($locale) oder Domain ($domain) nicht bekannt.", 1);
        }

        $filepath = rtrim((string)$this->getTranslationsFolder($bundle), '/')
            . '/' .  $domain
            . '.' . $locale . '.yml';

        if (!file_exists($filepath) || !is_writable($filepath)) {
            throw new \Exception("Sprachdatei existiert nicht oder ist nicht beschreibbar.", 1);
        }

        $array = Yaml::parse(file_get_contents($filepath));

        $array[$key] = trim($translation);

        file_put_contents($filepath, Yaml::dump($array, 2));

        return true;
    }

    public function getTranslationsFolder($bundle)
    {
        try {
            return $this
                ->kernel
                ->locateResource('@' . $bundle . '/Resources/translations/');

        } catch (\Exception $e) {
            return false;
        }
    }
}
