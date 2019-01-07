<?php

namespace WhereGroup\CoreBundle\Tests;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use WhereGroup\CoreBundle\Component\FrontendCommand;
use Symfony\Component\DependencyInjection\Container;

/**
 * Class FrontendCommandTest
 *
 * @package WhereGroup\Tests\WhereGroup\CoreBundle\Component
 *
 */
class FrontendCommandTest extends KernelTestCase
{
    /** @var  Container*/
    private $frontendCommand;
    private $core;
    private $response;

    /**
     * FrontendCommandTest constructor.
     * @param null $name
     * @param array $data
     * @param string $dataName
     */
    public function __construct($name = null, array $data = [], $dataName = '')
    {
        parent::__construct($name, $data, $dataName);

        self::bootKernel();

        $container = self::$kernel->getContainer();
        $this->core = $container->get('metador_core');
    }

    public function setUP()
    {
        $this->frontendCommand = new FrontendCommand($this->core);
        $this->response = [];
    }

    /**
     * @test
     */

    public function testRedirect()
    {
        $url = 'redirect_url';
        $frontendCommand = $this->frontendCommand->redirect($this->response, $url);

        $this->assertInstanceOf(FrontendCommand::class, $frontendCommand);

        $this->assertSame($this->frontendCommand, $frontendCommand);

        $this->assertEquals([
            'METADOR' => [
                'runMethod' => [
                    [
                        'class'    => 'metador',
                        'method'   => 'redirect',
                        'argument' => $url
                    ]
                ]
            ]
        ], $this->response);
    }

    public function testChangeLocation()
    {
        $url = 'changeLocation_url';
        $frontendCommand = $this->frontendCommand->changeLocation($this->response, $url);

        $this->assertSame($this->frontendCommand, $frontendCommand);

        $this->assertEquals([
            'METADOR' => [
                'runMethod' => [
                    [
                        'class'    => 'metador',
                        'method'   => 'changeLocation',
                        'argument' => $url
                    ]
                ]
            ]
        ], $this->response);
    }

    public function testDisplayInfo()
    {
        $url = 'displayInfo_url';
        $frontendCommand = $this->frontendCommand->displayInfo($this->response, $url);

        $this->assertSame($this->frontendCommand, $frontendCommand);

        $this->assertEquals([
            'METADOR' => [
                'runMethod' => [
                    [
                        'class'    => 'metador',
                        'method'   => 'displayInfo',
                        'argument' => $url
                    ]
                ]
            ]
        ], $this->response);
    }

    public function testDisplaySuccess()
    {
        $url = 'displaySuccess_url';
        $frontendCommand = $this->frontendCommand->displaySuccess($this->response, $url);

        $this->assertSame($this->frontendCommand, $frontendCommand);

        $this->assertEquals([
            'METADOR' => [
                'runMethod' => [[
                    'class'    => 'metador',
                    'method'   => 'displaySuccess',
                    'argument' => $url
                ]]
            ]
        ], $this->response);
    }

    public function testDisplayWarning()
    {
        $url = 'displayWarning_url';
        $frontendCommand = $this->frontendCommand->displayWarning($this->response, $url);

        $this->assertSame($this->frontendCommand, $frontendCommand);

        $this->assertEquals([
            'METADOR' => [
                'runMethod' => [[
                    'class'    => 'metador',
                    'method'   => 'displayWarning',
                    'argument' => $url
                ]]
            ]
        ], $this->response);
    }

    public function testDisplayError()
    {
        $url = 'displayError';
        $frontendCommand = $this->frontendCommand->displayError($this->response, $url);

        $this->assertSame($this->frontendCommand, $frontendCommand);

        $this->assertEquals([
            'METADOR' => [
                'runMethod' => [
                    [
                        'class'    => 'metador',
                        'method'   => 'displayError',
                        'argument' => $url
                    ]
                ]
            ]
        ], $this->response);
    }
}
