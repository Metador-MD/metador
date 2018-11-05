<?php

namespace WhereGroup\CoreBundle\Component\Search;

/**
 * Interface FilterReader
 * @package WhereGroup\CoreBundle\Component\Search
 * @author Paul Schmidt <panadium@gmx.de>
 */
interface FilterReader
{
    /**
     * @param mixed $filter
     * @param ExprHandler $expression
     * @return null|Expression
     * @throws PropertyNameNotFoundException
     */
    public static function read($filter, ExprHandler $expression);


    /**
     * @param mixed $filter
     * @param ExprHandler $expression
     * @return null|Expression
     * @throws PropertyNameNotFoundException
     */
    public static function readFromCsw($filter, ExprHandler $expression);
}
