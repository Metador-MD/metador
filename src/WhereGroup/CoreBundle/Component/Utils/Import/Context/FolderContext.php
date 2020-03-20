<?php

namespace WhereGroup\CoreBundle\Component\Utils\Import\Context;

/**
 * Class FolderContext
 * @package WhereGroup\CoreBundle\Component\Utils\Import\Context
 */
class FolderContext implements Context
{
    private $service;
    private $folder;
    private $name;
    private $overrideFile;

    /**
     * @return mixed
     */
    public function getFolder()
    {
        return $this->folder;
    }

    /**
     * @param mixed $folder
     * @return FolderContext
     */
    public function setFolder($folder)
    {
        $this->folder = $folder;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param mixed $name
     * @return FolderContext
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getService()
    {
        return $this->service;
    }

    /**
     * @param mixed $service
     * @return FolderContext
     */
    public function setService($service)
    {
        $this->service = $service;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getOverrideFile()
    {
        return $this->overrideFile;
    }

    /**
     * @param mixed $overrideFile
     * @return FolderContext
     */
    public function setOverrideFile($overrideFile)
    {
        $this->overrideFile = $overrideFile;

        return $this;
    }
}
