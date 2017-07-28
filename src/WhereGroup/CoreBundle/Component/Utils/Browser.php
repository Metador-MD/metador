<?php

namespace WhereGroup\CoreBundle\Component\Utils;

use WhereGroup\CoreBundle\Component\Configuration;

/**
 * Class Browser
 * @package WhereGroup\CoreBundle\Component\Utils
 */
class Browser
{
    private $proxyHost = '';
    private $proxyPort = '';
    private $proxyUser = '';
    private $proxyPass = '';
    private $responseHeader = '';
    private $conf;

    /**
     * Browser constructor.
     * @param Configuration $conf
     */
    public function __construct(Configuration $conf)
    {
        $this->conf = $conf;

        $this->useProxy(
            $conf->get('proxy_host', 'plugin', 'metador_core', ''),
            $conf->get('proxy_port', 'plugin', 'metador_core', ''),
            $conf->get('proxy_user', 'plugin', 'metador_core', ''),
            $conf->get('proxy_pass', 'plugin', 'metador_core', '')
        );
    }

    /**
     * @param $host
     * @param $port
     * @param string $user
     * @param string $pass
     * @return $this
     */
    public function useProxy($host, $port, $user = '', $pass = '')
    {
        $this->proxyHost = $host;
        $this->proxyPort = $port;
        $this->proxyUser = $user;
        $this->proxyPass = $pass;

        return $this;
    }

    /**
     * @param $url
     * @return bool|string
     * @throws \Exception
     */
    public function get($url)
    {
        $options['http']['method'] = 'GET';

        if (!empty($this->proxyHost) && !empty($this->proxyPort)) {
            $options['http']['proxy'] = 'tcp://' . $this->proxyHost . ':' . $this->proxyPort;
            $options['http']['request_fulluri'] = true;
        }

        if (!empty($this->proxyUser) && !empty($this->proxyPass)) {
            $options['http']['header'] = 'Proxy-Authorization: Basic ' . base64_encode(
                $this->proxyUser . ':' . $this->proxyPass
            );
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new \Exception("URL is not a valid.");
        }

        $this->responseHeader = get_headers($url);

        $content = @file_get_contents($url, false, stream_context_create($options));

        return $content;
    }
}
