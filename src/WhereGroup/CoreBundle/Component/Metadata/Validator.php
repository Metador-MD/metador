<?php

namespace WhereGroup\CoreBundle\Component\Metadata;

use WhereGroup\CoreBundle\Component\Exceptions\MetadataException;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;
use WhereGroup\PluginBundle\Component\Plugin;
use Symfony\Component\HttpKernel\KernelInterface;
use WhereGroup\CoreBundle\Component\Configuration;

/**
 * Class Validator
 * @package WhereGroup\CoreBundle\Component\Metadata
 */
class Validator
{
    /** @var  Plugin */
    protected $plugin;

    /** @var Configuration  */
    private $conf;

    /**
     * Validator constructor.
     * @param Plugin $plugin
     * @param Configuration $conf
     */
    public function __construct(Plugin $plugin, Configuration $conf)
    {
        $this->plugin = $plugin;
        $this->conf   = $conf;
    }

    public function __destruct()
    {
        unset(
            $this->plugin,
            $this->conf
        );
    }

    /**
     * @param array $p
     * @param $debug
     * @return bool
     * @throws MetadataException
     * @throws \Exception
     */
    public function isValid(array $p, &$debug = null)
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

        return $this->objectIsValid($p, $rules, $debug);
    }

    /**
     * @param $p
     * @param $rules
     * @param $debug
     * @return bool
     */
    public function objectIsValid($p, $rules, &$debug)
    {
        $metadataObject = $p;
        $tempRules = $rules;

        $this->prepairObject($metadataObject);

        if (!isset($debug['errors'])) {
            $debug['errors'] = [];
        }

        $this->testObject($metadataObject, $rules, $tempRules, $debug, [], $p['_profile']);

        if (!is_null($debug) && is_array($tempRules) && !empty($tempRules)) {
            foreach ($tempRules as $key => $rules) {
                foreach ($rules as $index => $rule) {
                    if (isset($rule['assert']) && !in_array($rule['assert'], [
                        'notBlank', 'oneIsMandatory', 'onlyOne'
                    ])) {
                        continue;
                    }

                    $debug['object'][$key][$index] = [
                        'test' => $rule,
                        'missingData' => true
                    ];

                    $debug['errors'][] = $rule;
                    $debug['messages'][] = [
                        'key'     => $key,
                        'message' => $rule['message']
                    ];
                }
            }
        }

        return empty($debug['errors']) ? true : false;
    }

    /**
     * @param $profile
     * @param $key
     * @param $val
     * @param $debug
     */
    private function testListOption($profile, $key, $val, &$debug)
    {
        if (is_array($val)) {
            foreach ($val as $string) {
                $list = $this->conf->get($key, 'list-option', $profile);

                if (is_array($list) && !isset($list[$string])) {
                    $debug['errors'][] = 'Unknown list value';
                    $debug['messages'][] = [
                        'key'     => $key,
                        'message' => "Der Wert '" . $string . "' ist in der Liste nicht enthalten."
                    ];
                }
            }
            return;
        }
        

        $list = $this->conf->get($key, 'list-option', $profile);

        if (is_array($list) && !isset($list[$val])) {
            $debug['errors'][] = 'Unknown list value';
            $debug['messages'][] = [
                'key'     => $key,
                'message' => "Der Wert '" . $val . "' ist in der Liste nicht enthalten."
            ];
        }
    }

    /**
     * @param $p
     * @param $rules
     * @param $tempRules
     * @param $debug
     * @param array $parent
     * @param string $profile
     */
    private function testObject(&$p, $rules, &$tempRules, &$debug, $parent = [], $profile = "")
    {
        foreach ($p as $key => &$val) {

            // Test List
            $this->testListOption($profile, $key, $val, $debug);

            if (is_array($val) && ArrayParser::hasStringKeys($val)) {
                $this->testObject($p[$key], $rules, $tempRules, $debug, $val, $profile);
                continue;
            }

            if (isset($rules[$key])) {
                unset($tempRules[$key]);

                foreach ($rules[$key] as $index => $rule) {
                    $debug['object'][$key][$index] = ['test' => $rule, 'untested' => true, 'invalid' => true];

                    // notBlank
                    if (isset($rule['assert']) && $rule['assert'] === 'notBlank') {
                        unset($debug['object'][$key][$index]['untested']);

                        if ($this->isNotEmpty($val)) {
                            unset($debug['object'][$key][$index]['invalid']);

                            continue;
                        }
                    // allOrNothing
                    } elseif (isset($rule['assert']) && $rule['assert'] === 'allOrNothing') {
                        unset($debug['object'][$key][$index]['untested']);

                        $count = $this->countEmptyElements($p, $parent, $rule);

                        if (($this->isNotEmpty($val) && $count === 0)
                            || ($this->isEmpty($val) && $count === count($rule['siblings']))) {
                            unset($debug['object'][$key][$index]['invalid']);
                            continue;
                        }
                    // onlyOne
                    } elseif (isset($rule['assert']) && $rule['assert'] === 'onlyOne') {
                        unset($debug['object'][$key][$index]['untested']);

                        $count = $this->countNotEmptyElements($p, $parent, $rule);

                        if (($this->isNotEmpty($val) && $count === 0) || ($this->isEmpty($val) && $count === 1)) {
                            unset($debug['object'][$key][$index]['invalid']);
                            continue;
                        }
                    // mandatoryIfSiblingNotEmpty
                    } elseif (isset($rule['assert']) && $rule['assert'] === 'mandatoryIfSiblingNotEmpty') {
                        unset($debug['object'][$key][$index]['untested']);

                        $count = $this->countNotEmptyElements($p, $parent, $rule);

                        if (($count >= 1 && $this->isNotEmpty($val)) || $count === 0) {
                            unset($debug['object'][$key][$index]['invalid']);
                            continue;
                        }
                    } elseif (isset($rule['assert']) && $rule['assert'] === 'testSiblings') {
                        unset(
                            $debug['object'][$key][$index]['untested'],
                            $debug['object'][$key][$index]['invalid']
                        );
                        continue;
                    // oneIsMandatory
                    } elseif (isset($rule['assert']) && $rule['assert'] === 'oneIsMandatory') {
                        unset($debug['object'][$key][$index]['untested']);

                        $count = $this->countNotEmptyElements($p, $parent, $rule);

                        if ($this->isNotEmpty($val) || $count >= 1) {
                            unset($debug['object'][$key][$index]['invalid']);
                            continue;
                        }
                    // regex
                    } elseif (isset($rule['regex'])) {
                        unset($debug['object'][$key][$index]['untested']);

                        if (preg_match("/" . $rule['regex'] . "/", $val)) {
                            unset($debug['object'][$key][$index]['invalid']);
                            continue;
                        }
                    }

                    $debug['errors'][] = $rule;
                }

                continue;
            }

            $debug['noRules'][$key] = 'NO RULE!';
        }
    }

    /**
     * @param $value
     * @return bool
     */
    private function isEmpty($value)
    {
        if (is_string($value)) {
            $value = trim($value);
        }

        return empty($value);
    }

    /**
     * @param $value
     * @return bool
     */
    private function isNotEmpty($value)
    {
        return !$this->isEmpty($value);
    }

    /**
     * @param $arr1
     * @param $arr2
     * @param $rule
     * @return bool|int
     */
    private function countEmptyElements(&$arr1, &$arr2, $rule)
    {
        if (!isset($rule['siblings']) || empty($rule['siblings'])) {
            return false;
        }

        $count = 0;

        foreach ($rule['siblings'] as $key) {
            // Search in siblings
            if (is_array($arr2) && !empty($arr2)) {
                if ((isset($arr2[$key]) && $this->isEmpty($arr2[$key])) || !isset($arr2[$key])) {
                    ++$count;
                }

                if (!isset($arr2[$key])) {
                    $arr2[$key] = '';
                }
                continue;
            }

            // Search in parent array
            if ((isset($arr1[$key]) && $this->isEmpty($arr1[$key])) || !isset($arr1[$key])) {
                ++$count;
            }

            if (!isset($arr1[$key])) {
                $arr1[$key] = '';
            }
        }

        return $count;
    }

    /**
     * @param $arr1
     * @param $arr2
     * @param $rule
     * @return bool|int
     */
    private function countNotEmptyElements(&$arr1, &$arr2, $rule)
    {
        $count = $this->countEmptyElements($arr1, $arr2, $rule);

        if ($count === false) {
            return false;
        }

        return count($rule['siblings']) - $count;
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

            $keys[$validatorKey] = null;

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
