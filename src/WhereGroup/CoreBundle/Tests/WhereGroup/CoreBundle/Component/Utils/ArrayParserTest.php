<?php

namespace WhereGroup\Tests\WhereGroup\CoreBundle\Component\Utils;

use PHPUnit\Framework\TestCase;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;

/**
 * Class ArrayParserTest
 * @package WhereGroup\Tests\WhereGroup\CoreBundle\Component\Utils
 */
class ArrayParserTest extends TestCase
{
    private $array;
    private $types;

    public function __construct($name = null, array $data = array(), $dataName = '')
    {
        parent::__construct($name, $data, $dataName);

        $object = new \stdClass();
        $object->a = 'a';
        $object->b = 'b';
        $object->c = 'c';

        $this->types = array(
            'array'  => array(1,2,3),
            'object' => $object,
            'string' => 'Hello',
            'number' => 345
        );

        $this->array = array(
            'types' => $this->types,
            'user'  => array(
                array('name' => 'Max'),
                array('name' => 'Thomas'),
                array('name' => 'Jochen')
            )
        );
    }

    public function testGet()
    {
        $this->assertEquals($this->types, ArrayParser::get($this->array, 'types'));
        $this->assertEquals('Hello', ArrayParser::get($this->array, 'types:string'));
        $this->assertEquals(345, ArrayParser::get($this->array, 'types:number'));
        $this->assertEquals('Thomas', ArrayParser::get($this->array, 'user:1:name'));
        $this->assertEquals(null, ArrayParser::get($this->array, 'i:dont:exist'));
    }

    public function testSet()
    {
        $array = $this->array;

        // Adds number 4 to array.
        // But normally you should use ArrayParser::append($array, 'types:array', 4); to do that.
        ArrayParser::set($array, 'types:array:3', 4);
        $this->assertEquals(array(1,2,3,4), ArrayParser::get($array, 'types:array'));

        // Replaces the array with number 4.
        ArrayParser::set($array, 'types:array', 4);
        $this->assertEquals(4, ArrayParser::get($array, 'types:array'));
    }

    public function testDelete()
    {
        ;
    }

    public function testIsEmpty()
    {
        ;
    }

    public function testLength()
    {
        $this->assertEquals(3, ArrayParser::length($this->array, 'types:array'));
        $this->assertEquals(3, ArrayParser::length($this->array, 'types:object'));
        $this->assertEquals(5, ArrayParser::length($this->array, 'types:string'));
        $this->assertEquals(345, ArrayParser::length($this->array, 'types:number'));
    }

    public function testExists()
    {
        $this->assertEquals(true, ArrayParser::exists($this->array, 'types:array'));
        $this->assertEquals(true, ArrayParser::exists($this->array, 'types:array', 2));
//        $this->assertEquals(true, ArrayParser::exists($this->array, 'user:name', 'Thomas'));
        $this->assertEquals(false, ArrayParser::exists($this->array, 'i:dont:exist'));
    }

    public function testAppend()
    {
        $array = $this->array;

        ArrayParser::append($array, 'types:array', 4);
        $this->assertEquals(array(1,2,3,4), ArrayParser::get($array, 'types:array'));
    }

    public function testMerge()
    {
        $array1 = ['X' => ['Y' => ['one' => '1']]];
        $array2 = ['X' => ['Y' => ['two' => '2']]];

        $this->assertEquals([
            'X' => array(
                'Y' => array(
                    'one' => '1',
                    'two' => '2'
                )
            )
        ], ArrayParser::merge($array1, $array2));
    }
}
