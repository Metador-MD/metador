<?php
/**
 * Created by PhpStorm.
 * User: paul
 * Date: 14.06.17
 * Time: 10:33
 */

namespace Plugins\WhereGroup\MapBundle\Component\XmlUtils;

/**
 * Class AssocArrayWriter
 * @package Plugins\WhereGroup\MapBundle\Component\XmlUtils
 * @author Paul Schmidt <panadium@gmx.de>
 */
class AssocArrayWriter implements IContextWriter
{

    protected $content;

    public function __construct()
    {
        $this->reset();
    }

    public function reset()
    {
        ;
    }

    public function write(array $content)
    {
        return $content;
    }
}
