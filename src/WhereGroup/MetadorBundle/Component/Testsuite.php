<?php
namespace WhereGroup\MetadorBundle\Component;

/**
 * Class Testsuite
 * @package WhereGroup\MetadorBundle\Component
 * @author A. R. Pour
 */
class Testsuite
{
    protected $client = null;
    protected $user = null;
    protected $password = null;
    protected $cache = array();

    /**
     * @param $wsdl
     * @param null $user
     * @param null $password
     * @param null $proxy_host
     * @param null $proxy_port
     */
    public function __construct($wsdl, $user = null, $password = null, $proxy_host = null, $proxy_port = null)
    {
        $conf = array();

        if (!is_null($proxy_host) && !is_null($proxy_port)) {
            $conf = array(
                'proxy_host' => $proxy_host,
                'proxy_port' => $proxy_port
            );
        }

        $this->client = new \SoapClient($wsdl, $conf);

        if (!is_null($user)) {
            $this->setUser($user);
        }

        if (!is_null($password)) {
            $this->setPassword($password);
        }
    }

    /**
     * @param $user
     */
    public function setUser($user)
    {
        $this->user = $user;
    }

    /**
     * @param $password
     */
    public function setPassword($password)
    {
        $this->password = $password;
    }

    /**
     * @param bool $ignoreCache
     * @return mixed
     */
    public function getTestClasses($ignoreCache = false)
    {
        if (!$ignoreCache && isset($this->cache['getTestClasses'])) {
            return $this->cache['getTestClasses'];
        }

        return $this->cache['getTestClasses'] = $this->client->__soapCall('getTestClasses', array(
            'userName' => $this->user,
            'pass' => $this->password
        ));
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getTestClass($id)
    {
        return $this->client->__soapCall('getTestClass', array(
            'userName' => $this->user,
            'pass' => $this->password,
            'testClassID' => $id
        ));
    }

    /**
     * @return array
     */
    public function getDocuments()
    {
        $result = $this->client->__soapCall('getTestConfigurations', array(
            'userName' => $this->user,
            'pass' => $this->password
        ));

        $configurations = array();

        if (is_array($result->item)) {
            foreach ($result->item as $item) {

                $configurations[] = array(
                    'id' => $item->ID,
                    'name' => $item->Name
                );
            }
        } elseif (isset($result->item->ID)) {
            $configurations[] = array(
                'id' => $result->item->ID,
                'name' => $result->item->Name
            );
        }

        return $configurations;
    }

    /**
     * @param $name
     * @param $description
     * @param $notify
     * @param $fileArray
     * @param $fileName
     * @param $url
     * @param $saveReport
     * @param $tk_ID
     * @param $confClassID
     * @param $sourceType
     * @return mixed
     */
    public function setTestConfiguration(
        $name,
        $description,
        $notify,
        $fileArray,
        $fileName,
        $url,
        $saveReport,
        $tk_ID,
        $confClassID,
        $sourceType
    ) {
        return $this->client->__soapCall('setTestConfiguration', array(
            'userName' => $this->user,
            'pass' => $this->password,
            'name' => $name,
            'description' => $description,
            'notify' => $notify,
            'fileArray' => $fileArray,
            'fileName' => $fileName,
            'url' => $url,
            'saveReport' => $saveReport,
            'tk_ID' => $tk_ID,
            'confClassID' => $confClassID,
            'sourceType' => $sourceType
        ));
    }

    /**
     * @param $id
     * @return mixed
     */
    public function startTestConfiguration($id)
    {
        return $this->client->__soapCall('startTestConfiguration', array(
            'userName' => $this->user,
            'pass' => $this->password,
            'testConfID' => $id
        ));
    }

    /**
     * @param $id
     * @return mixed
     */
    public function deleteTestConfiguration($id)
    {
        return $this->client->__soapCall('deleteTestConfiguration', array(
            'userName' => $this->user,
            'pass' => $this->password,
            'testConfID' => $id
        ));
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getTestStatus($id)
    {
        return $this->client->__soapCall('getTestStatus', array(
            'userName' => $this->user,
            'pass' => $this->password,
            'testConfID' => $id
        ));
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getTestReport($id)
    {
        return $this->client->__soapCall('getTestReport', array(
            'userName' => $this->user,
            'pass' => $this->password,
            'reportID' => $id
        ));
    }

    /**
     * @param $id
     * @param $name
     */
    public function forcePDFDownload($id, $name)
    {
        header('Content-disposition: attachment; filename='.$name.'.pdf');
        header('Content-type: application/pdf');
        print $this->getTestReportPDF($id);
        die;
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getTestReportPDF($id)
    {
        return $this->client->__soapCall('getTestReportPDF', array(
            'userName' => $this->user,
            'pass' => $this->password,
            'reportID' => $id
        ));
    }

    /**
     * @return mixed
     */
    public function deleteAllTestReport()
    {
        return $this->client->__soapCall('deleteAllTestReport', array(
            'userName' => $this->user,
            'pass' => $this->password
        ));
    }
}
