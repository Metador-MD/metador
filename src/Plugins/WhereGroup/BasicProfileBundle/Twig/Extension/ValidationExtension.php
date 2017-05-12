<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Twig\Extension;

use WhereGroup\PluginBundle\Component\Plugin;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * Class ValidationExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class ValidationExtension extends \Twig_Extension
{
    protected $plugin;
    protected $translator;

    /**
     * ValidationExtension constructor.
     * @param Plugin $plugin
     * @param TranslatorInterface $translator
     */
    public function __construct(Plugin $plugin, TranslatorInterface $translator)
    {
        $this->plugin = $plugin;
        $this->translator = $translator;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction(
                'read_validation_rules',
                array($this, 'readValidationRules'),
                array('is_safe' => array('html'))
            )
        );
    }

    /**
     * @param $profile
     * @return string
     * @throws \Exception
     */
    public function readValidationRules($profile)
    {
        $pluginPath = $this->plugin->locate($profile);
        $file = $pluginPath . '/Resources/config/validation.json';

        if (!$pluginPath || !file_exists($file)) {
            return "";
        }

        $validatonRules = json_decode(file_get_contents($file), true);

        if (!is_array($validatonRules)) {
            throw new \Exception("Can not parse validation.json file.");
        }

        foreach ($validatonRules as $key => $value) {
            for ($i=0; $i<count($validatonRules[$key]); $i++) {
                $validatonRules[$key][$i]['message'] =
                    $this->translator->trans($validatonRules[$key][$i]['message']);
            }
        }

        return json_encode($validatonRules, JSON_FORCE_OBJECT);
    }


    /**
     * @return string
     */
    public function getName()
    {
        return "metador_basic_profile_validation";
    }
}
