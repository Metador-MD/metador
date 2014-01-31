<?php
namespace WhereGroup\MetadorBundle\Component;

class XmlParserFunctions  {

    public function get($method, $data, $args = null) {
        if(method_exists($this, $method))
            $data = call_user_func('self::' . $method, $data, $args);
        
        return $data;
    }

    protected function replaceKey($data, $args = null) {
        $array = array();

        foreach ($data as $key => $val) {
            if($key === '#KEY#')
                return $val;

            if (is_array($val)) {
                $newKey = $this->replaceKey($val);

                if ($newKey && !is_array($newKey)) {
                    unset($val['#KEY#']);
                    $array[$newKey] = $val;
                }
            }
        }
        
        return $array;
    }

    protected function asText($data, $args = null) {
        return is_array($data) ? trim(implode(" ", $data)) : $data;
    }

    protected function asArray($data, $args = null) {
       return is_array($data) ? $data : array($data);
    }

    protected function commaSeparated($data, $args = null) {
        return is_array($data) ? implode(", ", $data) : $data;
    }
    
    protected function replace($data, $args = null) {
        return str_replace($args[0], $args[1], $data);
    }
}