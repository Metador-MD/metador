<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Class AjaxResponse
 * @package WhereGroup\CoreBundle\Component
 */
class AjaxResponse extends JsonResponse
{
    /**
     * AjaxResponse constructor.
     * @param null $data
     * @param int $status
     * @param array $headers
     */
    public function __construct($data = null, $status = 200, $headers = [])
    {
        parent::__construct('', $status, $headers);

        if (null === $data) {
            $data = new \ArrayObject();
        }

        $data = array_merge_recursive(
            $data,
            array(
                'METADOR' => array(
                    'runMethod' => array(
                        array(
                            'class'    => 'session',
                            'method'   => 'setTimeout',
                            'argument' => ini_get("session.gc_maxlifetime")
                        )
                    )
                )
            )
        );

        $this->setData($data);
    }
}
