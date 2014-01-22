<?php
namespace WhereGroup\MetadorBundle\Component;

class XmlParserFunctions  {

    public function get($method, $data, $args = null) {
                        
        // functions einbauen
        // if(is_callable('$this->' . $val[1])) {
        //     $tmp = call_user_func('$this->' . $val[1], $tmp, array_slice($val, 2));
        // }
    }

    protected static function commaSeparated($data, $args = null) {
        return is_array($data) ? implode(", ", $data) : $data;
    }
    
    protected static function replace($data, $args = null) {
        return str_replace($args[0], $args[1], $data);
    }
}