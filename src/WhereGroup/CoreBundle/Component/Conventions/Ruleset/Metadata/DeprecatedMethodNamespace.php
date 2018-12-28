<?php

namespace WhereGroup\CoreBundle\Component\Conventions\Ruleset\Metadata;

use WhereGroup\CoreBundle\Component\Conventions\Result;
use WhereGroup\CoreBundle\Component\Conventions\Rule;

/**
 * Class DeprecatedNamespace
 * @package WhereGroup\CoreBundle\Component\Conventions\Rulesets
 */
class DeprecatedMethodNamespace extends Rule
{
    protected $message = 'Namespace "Sensio\Bundle\FrameworkExtraBundle\Configuration\Method" is deprecated, 
    use "Symfony\Component\Routing\Annotation\Route" instead!';

    /**
     * @param Result $result
     */
    public function scanMetadata(Result $result)
    {
        if (empty($result->data['use']) || empty($result->data['files'])) {
            return;
        }

        foreach ($result->data['use'] as $namespace => $files) {
            if (preg_match('/Sensio\\\Bundle\\\FrameworkExtraBundle\\\Configuration\\\Method/', $namespace)) {
                foreach ($result->data['use'][$namespace] as $hash => $line) {
                    $result->addError(DeprecatedMethodNamespace::class, $hash, $line);
                }
            }
        }
    }
}
