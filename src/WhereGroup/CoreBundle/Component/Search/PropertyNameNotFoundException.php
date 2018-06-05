<?php

namespace WhereGroup\CoreBundle\Component\Search;

use Throwable;

/**
 * Class PropertyNameNotFoundException
 * @package WhereGroup\CoreBundle\Component\Search
 * @author  Paul Schmidt <panadium@gmx.de>
 */
class PropertyNameNotFoundException extends \Exception
{
    /**
     * @var string
     */
    private $propertyName;

    /**
     * PropertyNameNotFoundException constructor.
     * @param string $propertyName
     * @param string $message
     * @param int $code
     * @param Throwable|null $previous
     */
    public function __construct($propertyName, $message = "", $code = 0, Throwable $previous = null)
    {
        parent::__construct(
            $message ? $message : 'The property name "'.$propertyName.'" is not found.',
            $code,
            $previous
        );
        $this->propertyName = $propertyName;
    }

    /**
     * @return string
     */
    public function getPropertyName()
    {
        return $this->propertyName;
    }
}
