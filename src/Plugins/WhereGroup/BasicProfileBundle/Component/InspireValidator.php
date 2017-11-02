<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Component;

/**
 * Class InspireValidator
 * @package Plugins\WhereGroup\BasicProfileBundle\Component
 */
class InspireValidator
{
    /**
     * @param $xml
     * @return array
     */
    public function upload($xml)
    {
        // POST
        $path = '/v2/TestObjects';

        return [
            "ok"        => true,
            "error"     => "",
            "id"        => "",
            "password"  => "",
            "resources" => "",
            "username"  => ""
        ];
    }

    /**
     * @param $id
     * @return array
     */
    public function delete($id)
    {
        // DELETE
        $path = '/v2/TestObjects/{id}';

        //        204 Test Object deleted
        //        404 Test Object not found

        return [
            "ok" => true
        ];
    }

    /**
     * @param $id
     * @return array
     */
    public function exists($id)
    {
        // HEAD
        $path = '/v2/TestObjects/{id}';

        //        204 Test Object exists
        //        404 Test Object does not exist

        return [
            "ok" => true
        ];
    }

    /**
     * @param $id
     * @return array
     */
    public function get($id)
    {
        // GET
        $path = '/v2/TestObjects/{id}.json';

        return [
            "ok" => true
        ];
    }

    /**
     * @param $id
     * @return array
     */
    public function getData($id)
    {
        // GET
        $path = '/v2/TestObjects/{id}/data';

        return [
            "ok" => true
        ];
    }
}
