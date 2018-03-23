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

    /**
     * Validator constructor.
     * @param Plugin $plugin
     */
    public function __construct(Plugin $plugin)
    {
        $this->plugin = $plugin;
    }

    public function __destruct()
    {
        unset(
            $this->plugin
        );
    }

    /**
     * @param array $p
     * @return bool
     * @throws \Exception
     */
    public function isValid(array $p)
    {
        if (!isset($p['_public']) || (isset($p['_public']) && $p['_public'] === '0')) {
            return true;
        }

        if (!isset($p['_profile'])) {
            throw new MetadataException("Profile missing");
        }

        $rules = json_decode($this->plugin->getResource($p['_profile'], 'config/validation.json'), true);

        if (!is_array($rules)) {
            throw new MetadataException("Can not decode validation.json");
        }

        $x = $p;
        $error = [];

        $this->prepairObject($x);
        $this->testObject($x, $rules, $error);

        dump($x);

        return true;
    }

    /**
     * @param $array
     * @param $rules
     * @param $error
     */
    private function testObject(&$array, $rules, &$error)
    {
        foreach ($array as $key => $val) {
            if (is_array($val)) {
                $this->testObject($array[$key], $rules, $error);
                continue;
            }

            if (isset($rules[$key])) {
                foreach ($rules[$key] as $rule) {
                    if (isset($rule['assert']) && $rule['assert'] === 'notBlank' && trim($val) === '') {
                        $error[] = ['key' => $key, 'message' => $rule['message']];
                        continue;
                    }



                    $x = $rule;
                }
            }
        }
    }

    /**
     * @param $array
     * @param string $subkey
     */
    private function prepairObject(&$array, $subkey = 'p_')
    {
        foreach ($array as $key => $val) {
            if (substr($key, 0, 1) == '_') {
                unset($array[$key]);
                continue;
            }

            $validatorArrayKey = $subkey . strtolower($key);
            $validatorKey = preg_replace('/(_[\d]+_?)/s', '', $validatorArrayKey);

            if (is_array($val)) {
                $array[$validatorArrayKey] = $val;
                unset($array[$key]);

                $this->prepairObject($array[$validatorArrayKey], $validatorKey . '_');
                continue;
            }

            if (isset($array[$validatorKey]) && is_array($array[$validatorKey])) {
                $array[$validatorKey][] = $val;
            } elseif (isset($array[$validatorKey]) && is_string($array[$validatorKey])) {
                $temp = $array[$validatorKey];
                unset($array[$validatorKey]);

                $array[$validatorKey][] = $temp;
                $array[$validatorKey][] = $val;
                unset($temp);
            } else {
                $array[$validatorKey] = $val;
            }

            unset($array[$key]);
        }
    }
}
