<?php

namespace WhereGroup\CoreBundle\Component\Metadata;

use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\PluginBundle\Component\Plugin;
use Symfony\Component\HttpKernel\KernelInterface;

/**
 * Class Validator
 * @package WhereGroup\CoreBundle\Component\Metadata
 */
class Validator
{
    /** @var  Plugin */
    protected $plugin;

    /** @var KernelInterface */
    protected $kernel;

    /**
     * Validator constructor.
     * @param Plugin $plugin
     * @param KernelInterface $kernel
     */
    public function __construct(
        Plugin $plugin,
        KernelInterface $kernel
    ) {
        $this->plugin = $plugin;
        $this->kernel = $kernel;
    }

    public function __destruct()
    {
        unset(
            $this->plugin,
            $this->kernel
        );
    }

    /**
     * @param array $p
     * @return bool
     * @throws \Exception
     */
    public function isValid(array $p)
    {
        if (!isset($p['_profile'])) {
            throw new MetadataException("Profile missing");
        }

        $class    = $this->plugin->getPluginClassName($p['_profile']);
        $filepath = $this->kernel->locateResource('@' . $class . '/Resources/config/validation.json');

        if (!file_exists($filepath)) {
            throw new MetadataException("Validation file not found");
        }

        $rules = json_decode(file_get_contents($filepath), true);

        if (!is_array($rules)) {
            throw new MetadataException("Can not decode validation.json");
        }

        return true;
    }
}
