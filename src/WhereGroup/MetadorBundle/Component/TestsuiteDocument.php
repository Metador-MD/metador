<?php
namespace WhereGroup\MetadorBundle\Component;

/**
 * Class TestsuiteDocument
 * @package WhereGroup\MetadorBundle\Component
 * @author A. R. Pour
 */
class TestsuiteDocument extends Testsuite
{
    private $name = null;
    private $description = null;
    private $notify = 'NO';
    private $fileArray = null;
    private $fileName = null;
    private $url = null;
    private $saveReport = 'NO';
    private $tk_ID = null;
    private $confClassID = array();
    private $sourceType = null;
    private $id = null;
    private $reportId = null;

    /**
     * @param $wsdl
     * @param null $user
     * @param null $password
     * @param null $proxy_host
     * @param null $proxy_port
     */
    public function __construct($wsdl, $user = null, $password = null, $proxy_host = null, $proxy_port = null)
    {
        parent::__construct($wsdl, $user, $password, $proxy_host, $proxy_port);
    }

    /**
     * @param $url
     */
    public function setUrl($url)
    {
        $this->url = $url;
        $this->sourceType = 'URL';
    }

    /**
     * @param $xml
     * @param $name
     */
    public function setXml($xml, $name)
    {
        $this->fileArray = $xml;
        $this->fileName = $name;
        $this->sourceType = 'FILE';
    }

    /**
     * @param $id
     */
    public function setTkId($id)
    {
        $this->tk_ID = $id;
    }

    /**
     * @param $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @param $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * @param $notify
     */
    public function setNotify($notify)
    {
        $this->notify = ($notify) ? 'YES' : 'NO';
    }

    /**
     * @param $saveReport
     */
    public function setSaveReport($saveReport)
    {
        $this->saveReport = ($saveReport) ? 'YES' : 'NO';
    }

    /**
     * @return null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return null
     */
    public function getReportId()
    {
        return $this->reportId;
    }

    /**
     * @return mixed
     */
    public function addDocument()
    {
        return $this->id = $this->setTestConfiguration(
            $this->name,
            $this->description,
            $this->notify,
            $this->fileArray,
            $this->fileName,
            $this->url,
            $this->saveReport,
            $this->tk_ID,
            $this->confClassID,
            $this->sourceType
        );
    }

    /**
     * @param null $id
     * @return mixed
     */
    public function deleteDocument($id = null)
    {
        return $this->deleteTestConfiguration(is_null($id) ? $this->id : $id);
    }

    /**
     * @param null $id
     * @return mixed
     */
    public function testDocument($id = null)
    {
        return $this->reportId = $this->startTestConfiguration(is_null($id) ? $this->id : $id);
    }

    /**
     * @param null $id
     * @return mixed
     */
    public function getDocumentStatus($id = null)
    {
        return $this->getTestStatus(is_null($id) ? $this->id : $id);
    }

    /**
     * @param $id
     */
    public function setTestById($id)
    {
        if (is_array($id)) {
            foreach ($id as $singleId) {
                $this->setTestById($singleId);
            }

            return;
        }

        if (!in_array($id, $this->confClassID)) {
            $this->confClassID[] = $id;
        }
    }

    /**
     * @param $name
     */
    public function setTestByName($name)
    {
        if (is_array($name)) {
            foreach ($name as $singleName) {
                $this->setTestByName($singleName);
            }

            return;
        }

        $classes = $this->getTestClasses();

        foreach ($classes->item as $item) {
            if (trim($item->Name) === trim($name)) {
                $this->setTestById($item->ID);
            }

            foreach ($item->conformityClasses as $subitem) {
                if (trim($subitem->Name) === trim($name)) {
                    $this->setTestById($subitem->ID);
                }
            }
        }
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return
            'confClassID: ' . print_r($this->confClassID, true)
        ;
    }
}
