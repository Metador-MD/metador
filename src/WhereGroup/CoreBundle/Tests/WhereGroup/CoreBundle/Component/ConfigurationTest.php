<?php

namespace WhereGroup\Tests\WhereGroup\CoreBundle\Component;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\DependencyInjection\Container;
use WhereGroup\CoreBundle\Component\Configuration;

/**
 * Class ConfigurationTest
 * @package WhereGroup\Tests\WhereGroup\CoreBundle\Component
 */
class ConfigurationTest extends KernelTestCase
{
    /** @var  Container*/
    private $container;

    /** @var Configuration $conf */
    private $conf;

    public function setUp()
    {
        self::bootKernel();

        $this->container = self::$kernel->getContainer();
        $this->conf = $this->container->get('metador_configuration');
    }

    public function testSimpleGetAndSet()
    {
        // Simple set and get with number
        $actual = $this->conf
            ->set('my_key', 23)
            ->get('my_key');

        $this->assertEquals(23, $actual);

        // Change value
        $actual = $this->conf
            ->set('my_key', 50)
            ->get('my_key');

        $this->assertEquals(50, $actual);

        // Simple set and get with string
        $actual = $this->conf
            ->set('my_key', 'ABC')
            ->get('my_key');

        $this->assertEquals('ABC', $actual);

        // Simple set and get with array
        $actual = $this->conf
            ->set('my_key', array('ABC', 'DEF'))
            ->get('my_key');

        $this->assertEquals(array('ABC', 'DEF'), $actual);

        // Simple set and get with object
        $expected = new \stdClass();
        $expected->name = 'ABC';
        $expected->age = 39;

        $actual = $this->conf
            ->set('my_key', $expected)
            ->get('my_key');

        $this->assertEquals(array('name' => 'ABC', 'age' => 39), $actual);

        // Simple get nothing
        $actual = $this->conf->get('my_not_existing_key');
        $this->assertEquals(null, $actual);

        // Simple get default
        $actual = $this->conf->get('my_not_existing_key', '', '', 'party');
        $this->assertEquals('party', $actual);
    }

    public function testExtendedGetAndSet()
    {
        $this->conf
            ->set('my_key_1', 23, 'plugin', 'plugin_a')
            ->set('my_key_2', 23, 'plugin', 'plugin_a')
            ->set('my_key_3', array(1, 2), 'plugin', 'plugin_b')
            ->set('my_key_4', 23, 'plugin', 'plugin_b');

        // Test get
        $this->assertEquals(23, $this->conf->get('my_key_1', 'plugin', 'plugin_a'));

        // Test getAll
        $this->assertEquals(array(
            array('key' => 'my_key_1', 'value' => 23, 'filterType' => 'plugin', 'filterValue' => 'plugin_a'),
            array('key' => 'my_key_2', 'value' => 23, 'filterType' => 'plugin', 'filterValue' => 'plugin_a'),
        ), $this->conf->getAll('plugin', 'plugin_a'));

        // Test getAll
        $this->assertEquals(array(
            array('key' => 'my_key_1', 'value' => 23, 'filterType' => 'plugin', 'filterValue' => 'plugin_a'),
            array('key' => 'my_key_2', 'value' => 23, 'filterType' => 'plugin', 'filterValue' => 'plugin_a'),
            array('key' => 'my_key_3', 'value' => array(1, 2), 'filterType' => 'plugin', 'filterValue' => 'plugin_b'),
            array('key' => 'my_key_4', 'value' => 23, 'filterType' => 'plugin', 'filterValue' => 'plugin_b'),
        ), $this->conf->getAll('plugin'));
    }

    public function testTruncate()
    {
        $actual = $this->conf
            ->set('my_key', 23)
            ->truncate()
            ->get('my_key');

        $this->assertEquals(null, $actual);
    }

    public function testRemove()
    {
        $actual = $this->conf->set('my_key', 23)->remove('my_key')->get('my_key');
        $this->assertEquals(null, $actual);

        $actual = $this->conf
            ->set('my_key_1', 23, 'plugin', 'test')
            ->set('my_key_2', 23, 'plugin', 'test')
            ->removeAll('plugin', 'test')
            ->getAll('plugin', 'test');

        $this->assertEquals(array(), $actual);

        $actual = $this->conf
            ->set('my_key_1', 23, 'plugin', 'plugin_a')
            ->set('my_key_2', 23, 'plugin', 'plugin_a')
            ->set('my_key_3', 23, 'plugin', 'plugin_b')
            ->set('my_key_4', 23, 'plugin', 'plugin_b')
            ->removeAll('plugin')
            ->getAll('plugin');

        $this->assertEquals(array(), $actual);
    }
}
