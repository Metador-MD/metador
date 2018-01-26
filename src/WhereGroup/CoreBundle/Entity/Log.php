<?php

namespace WhereGroup\CoreBundle\Entity;

/**
 * Class Log
 * @package WhereGroup\CoreBundle\Entity
 */
class Log
{
    protected $type = 'info';
    protected $category = 'system';
    protected $subcategory = '';
    protected $operation = '';
    protected $source = '';
    protected $identifier = '';
    protected $message = '';
    protected $messageParameter = array();
    protected $user = null;
    protected $username = null;
    protected $dateTime = null;
    protected $flashMessage = false;
    protected $path = '';
    protected $params = array();

    /**
     * Log constructor.
     */
    public function __construct()
    {
        $this->dateTime = new \DateTime();
    }

    /**
     * @return mixed
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param $type
     * @return $this
     */
    public function setType($type)
    {
        $this->type = $type;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * @return string
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @param string $path
     * @return Log
     */
    public function setPath(string $path)
    {
        $this->path = $path;
        return $this;
    }

    /**
     * @return array
     */
    public function getParams(): array
    {
        return $this->params;
    }

    /**
     * @param array $params
     * @return Log
     */
    public function setParams(array $params)
    {
        $this->params = $params;
        return $this;
    }

    /**
     * @param $message
     * @param null $parameter
     * @return $this
     */
    public function setMessage($message, $parameter = null)
    {
        $this->message = $message;

        if (!is_null($parameter)) {
            $this->messageParameter = $parameter;
        }

        return $this;
    }

    /**
     * @return array
     */
    public function getMessageParameter()
    {
        return $this->messageParameter;
    }

    /**
     * @param $messageParameter
     * @return $this
     * Todo: remove
     */
    public function setMessageParameter($messageParameter)
    {
        $this->messageParameter = $messageParameter;
        return $this;
    }

    /**
     * @return null
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param $user
     * @return mixed
     */
    public function setUser($user)
    {
        $this->user = $user;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * @param $username
     * @return $this
     */
    public function setUsername($username)
    {
        $this->username = $username;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getCategory()
    {
        return $this->category;
    }

    /**
     * @param mixed $category
     * @return Log
     */
    public function setCategory($category)
    {
        $this->category = $category;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getSubcategory()
    {
        return $this->subcategory;
    }

    /**
     * @param mixed $subcategory
     * @return Log
     */
    public function setSubcategory($subcategory)
    {
        $this->subcategory = $subcategory;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getOperation()
    {
        return $this->operation;
    }

    /**
     * @param mixed $operation
     * @return Log
     */
    public function setOperation($operation)
    {
        $this->operation = $operation;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * @param mixed $source
     * @return Log
     */
    public function setSource($source)
    {
        $this->source = $source;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getIdentifier()
    {
        return $this->identifier;
    }

    /**
     * @param mixed $identifier
     * @return Log
     */
    public function setIdentifier($identifier)
    {
        $this->identifier = $identifier;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDateTime()
    {
        return $this->dateTime;
    }

    /**
     * @param $dateTime
     * @return $this
     */
    public function setDateTime($dateTime)
    {
        $this->dateTime = $dateTime;
        return $this;
    }

    /**
     * @return bool
     */
    public function isFlashMessage()
    {
        return $this->flashMessage;
    }

    /**
     * @param $flashMessage
     * @return $this
     */
    public function setFlashMessage($flashMessage = true)
    {
        $this->flashMessage = (boolean)$flashMessage;
        return $this;
    }
}
