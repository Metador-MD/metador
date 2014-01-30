<?php
namespace WhereGroup\MetadorBundle\Component;

class XmlParserFunctions  {

    public function get($method, $data, $args = null) {
        if(method_exists($this, $method))
            $data = call_user_func('self::' . $method, $data, $args);
        
        return $data;
    }

    protected function asArray($data, $args = null) {
       return is_array($data) ? $data : array($data);
    }

    protected static function commaSeparated($data, $args = null) {
        return is_array($data) ? implode(", ", $data) : $data;
    }
    
    protected static function replace($data, $args = null) {
        return str_replace($args[0], $args[1], $data);
    }
}