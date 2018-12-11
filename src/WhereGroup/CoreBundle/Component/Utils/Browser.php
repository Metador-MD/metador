<?php

namespace WhereGroup\CoreBundle\Component\Utils;

use WhereGroup\CoreBundle\Component\Configuration;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;

/**
 * Class Browser
 * @package WhereGroup\CoreBundle\Component\Utils
 */
class Browser
{
    private $timeout   = 10;
    private $proxyHost = '';
    private $proxyPort = '';
    private $proxyUser = '';
    private $proxyPass = '';
    private $proxyExclude = [];
    private $header = [];
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
     * @param $host
     * @return $this
     */
    public function excludeHost($host)
    {
        if (trim($host) !== "") {
            $this->proxyExclude[] = trim($host);
        }

        return $this;
    }

    /**
     * @return $this
     */
    public function clearHeader()
    {
        $this->header = [];
        return $this;
    }

    /**
     * @param $header
     * @return $this
     */
    public function setHeader($header)
    {
        $this->header = $header;
        return $this;
    }

    /**
     * @param $url
     * @return bool|\stdClass
     * @internal param array $header
     * @throws MetadorException
     */
    public function get($url)
    {
        return $this->doRequest('GET', $url, null);
    }

    /**
     * @param $url
     * @param $data
     * @return bool|\stdClass
     * @internal param array $header
     * @throws MetadorException
     */
    public function post($url, $data)
    {
        return $this->doRequest('POST', $url, $data);
    }

    /**
     * @param $timeout
     * @return $this
     */
    public function setTimeout($timeout)
    {
        $this->timeout = (int)$timeout;

        return $this;
    }

    /**
     * @param $method
     * @param $url
     * @param $data
     * @return \stdClass
     * @throws MetadorException
     * @internal param array $header
     */
    private function doRequest($method, $url, $data)
    {
        $init    = curl_init();
        $urlInfo = parse_url(trim($url));

        if (isset($urlInfo['scheme']) && $urlInfo['scheme'] !== 'http' && $urlInfo['scheme'] !== 'https') {
            throw new MetadorException('Only http and https supported');
        }

        if (isset($urlInfo['port']) && !empty($urlInfo['port'])) {
            curl_setopt($init, CURLOPT_PORT, (int)$urlInfo['port']);
        }

        if ($method === 'GET') {
            curl_setopt($init, CURLOPT_POST, 0);
        } elseif ($method === 'POST') {
            curl_setopt($init, CURLOPT_POST, 1);
            curl_setopt($init, CURLOPT_POSTFIELDS, $data);
        }

        $url = $urlInfo['scheme'] . '://';

        if (isset($urlInfo['host']) && !empty($urlInfo['host'])) {
            $url .= $urlInfo['host'];
        }

        if (isset($urlInfo['path']) && !empty($urlInfo['path'])) {
            $url .= $urlInfo['path'];
        }

        if (isset($urlInfo['query']) && !empty($urlInfo['query'])) {
            $url .= '?' . $urlInfo['query'];
        }

        if (isset($urlInfo['fragment']) && !empty($urlInfo['fragment'])) {
            $url .= '#' . $urlInfo['fragment'];
        }

        curl_setopt($init, CURLOPT_URL, $url);
        curl_setopt($init, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($init, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($init, CURLINFO_HEADER_OUT, true);
        curl_setopt($init, CURLOPT_CONNECTTIMEOUT, 0);
        curl_setopt($init, CURLOPT_TIMEOUT, $this->timeout);

        if (!empty($this->header)) {
            curl_setopt($init, CURLOPT_HTTPHEADER, $this->header);
        }

        if (!empty($this->proxyHost) && !in_array($urlInfo["host"], $this->proxyExclude)) {
            curl_setopt($init, CURLOPT_PROXY, $this->proxyHost);
            curl_setopt($init, CURLOPT_PROXYPORT, $this->proxyPort);

            if (!empty($this->proxyUser) && !empty($this->proxyPass)) {
                curl_setopt($init, CURLOPT_PROXYUSERPWD, $this->proxyUser . ':' . $this->proxyPass);
                curl_setopt($init, CURLOPT_PROXYAUTH, CURLAUTH_NTLM);
            }
        }

        $response              = new \stdClass();
        $response->content     = curl_exec($init);
        $response->header      = curl_getInfo($init, CURLINFO_HEADER_OUT);
        $response->status      = (int)curl_getInfo($init, CURLINFO_HTTP_CODE);
        $response->statusText  = $this->getStatusCodeText($response->status);
        $response->contentType = curl_getInfo($init, CURLINFO_CONTENT_TYPE);
        $response->error       = curl_error($init);

        curl_close($init);

        return $response;
    }

    /**
     * @param $code
     * @return string
     */
    public function getStatusCodeText($code)
    {
        $text = 'Unknown http status code "' . htmlentities($code) . '"';

        switch ($code) {
            case 100:
                $text = 'Continue';
                break;
            case 101:
                $text = 'Switching Protocols';
                break;
            case 200:
                $text = 'OK';
                break;
            case 201:
                $text = 'Created';
                break;
            case 202:
                $text = 'Accepted';
                break;
            case 203:
                $text = 'Non-Authoritative Information';
                break;
            case 204:
                $text = 'No Content';
                break;
            case 205:
                $text = 'Reset Content';
                break;
            case 206:
                $text = 'Partial Content';
                break;
            case 300:
                $text = 'Multiple Choices';
                break;
            case 301:
                $text = 'Moved Permanently';
                break;
            case 302:
                $text = 'Moved Temporarily';
                break;
            case 303:
                $text = 'See Other';
                break;
            case 304:
                $text = 'Not Modified';
                break;
            case 305:
                $text = 'Use Proxy';
                break;
            case 400:
                $text = 'Bad Request';
                break;
            case 401:
                $text = 'Unauthorized';
                break;
            case 402:
                $text = 'Payment Required';
                break;
            case 403:
                $text = 'Forbidden';
                break;
            case 404:
                $text = 'Not Found';
                break;
            case 405:
                $text = 'Method Not Allowed';
                break;
            case 406:
                $text = 'Not Acceptable';
                break;
            case 407:
                $text = 'Proxy Authentication Required';
                break;
            case 408:
                $text = 'Request Time-out';
                break;
            case 409:
                $text = 'Conflict';
                break;
            case 410:
                $text = 'Gone';
                break;
            case 411:
                $text = 'Length Required';
                break;
            case 412:
                $text = 'Precondition Failed';
                break;
            case 413:
                $text = 'Request Entity Too Large';
                break;
            case 414:
                $text = 'Request-URI Too Large';
                break;
            case 415:
                $text = 'Unsupported Media Type';
                break;
            case 500:
                $text = 'Internal Server Error';
                break;
            case 501:
                $text = 'Not Implemented';
                break;
            case 502:
                $text = 'Bad Gateway';
                break;
            case 503:
                $text = 'Service Unavailable';
                break;
            case 504:
                $text = 'Gateway Time-out';
                break;
            case 505:
                $text = 'HTTP Version not supported';
                break;
        }

        return $text;
    }
}
