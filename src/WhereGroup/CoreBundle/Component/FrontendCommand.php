<?php

namespace WhereGroup\CoreBundle\Component;

/**
 * Class FrontendCommand
 * @package WhereGroup\CoreBundle\Component
 */
class FrontendCommand
{
    /**
     * @param $url
     * @param $response
     */
    public function redirect($url, &$response)
    {
        $response = array_merge_recursive($response, array(
            'METADOR' => array(
                'runMethod' => array(
                    array(
                        'class'    => 'metador',
                        'method'   => 'redirect',
                        'argument' => $url
                    )
                )
            )
        ));
    }
}
