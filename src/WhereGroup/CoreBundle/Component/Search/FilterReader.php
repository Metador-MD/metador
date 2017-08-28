<?php
/**
 * metador2
 * Created by PhpStorm.
 * User: Paul Schmidt
 * Date: 24.08.17 10:13
 */

namespace WhereGroup\CoreBundle\Component\Search;


interface FilterReader
{
    /**
     * @param $filter
     * @param Expression $expression
     */
    public static function read($filter, Expression &$expression);
}