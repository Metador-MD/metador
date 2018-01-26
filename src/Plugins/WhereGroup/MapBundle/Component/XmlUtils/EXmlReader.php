<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace Plugins\WhereGroup\MapBundle\Component\XmlUtils;

use XMLReader;

/**
 * Description of EXmlReader
 *
 * @author Paul Schmidt<panadium@gmx.de>
 */
class EXmlReader extends XMLReader
{
    /**
     * @var string
     */
    protected $xpath;
    /**
     * @var string
     */
    protected $currentName;
    /**
     * @var IContextReader
     */
    protected $contextReader;
    /**
     * @var IContextReader
     */
    protected $toOutputReader;
    /**
     * @var array an assoc array with readers
     */
    protected $readers;

    /**
     * EXmlReader constructor.
     * @param array $readers
     */
    public function __construct(array $readers = array())
    {
        $this->xpath = '';
        $this->readers = count($readers) > 0 ? $readers : array();
        $this->contextReader = null;
        $this->toOutputReader = null;
    }

    /**
     * @param $uri
     * @param array $readers
     * @param null $encoding
     * @param null $readOptions
     * @return null|EXmlReader
     */
    public static function create($uri, array $readers = array(), $encoding = null, $readOptions = null)
    {
        if (!$uri) {
            return null;
        }
        $reader = new EXmlReader($readers);
        $opened = $reader->open($uri, $encoding, $readOptions);

        return $opened ? $reader : null;
    }

    /**
     * @param array $path
     * @param IContextReader $reader
     */
    public function addReader($path, IContextReader $reader)
    {
        if (is_array($path)) {
            foreach ($path as $value) {
                $this->readers[$value] = $reader;
            }
        } else {
            $this->readers[$path] = $reader;
        }
    }

    /**
     * @return string xpath
     */
    public function getXpath()
    {
        return $this->xpath;
    }

    /**
     *
     */
    protected function activateContextReader()
    {
        if ($this->contextReader === null && isset($this->readers[$this->xpath])) {
            $this->toOutputReader = null;
            $this->contextReader = $this->readers[$this->xpath];
            $this->contextReader->reset();
        } elseif ($this->contextReader === null && isset($this->readers[$this->currentName])) {
            $this->toOutputReader = null;
            $this->contextReader = $this->readers[$this->currentName];
            $this->contextReader->reset();
        }
    }

    /**
     * @return IContextReader|null
     */
    protected function deactivateContextReader()
    {
        if ($this->contextReader !== null && isset($this->readers[$this->xpath])) {
            $this->contextReader = null;
            $this->toOutputReader = $this->readers[$this->xpath];

            return $this->toOutputReader;
        } elseif ($this->contextReader !== null && isset($this->readers[$this->currentName])) {
            $this->contextReader = null;
            $this->toOutputReader = $this->readers[$this->currentName];

            return $this->toOutputReader;
        }

        return null;
    }

    /**
     *
     */
    protected function fromRoot()
    {
        $this->currentName = $this->prefixedName();
        $this->xpath .= '/'.$this->currentName;
    }

    /**
     *
     */
    protected function toRoot()
    {
        $this->currentName = $this->prefixedName();
        $this->xpath = substr($this->xpath, 0, strlen($this->xpath) - strlen('/'.$this->currentName));
    }

    /**
     * Returns a prefixed name for current element.
     * @return string prefixed name
     */
    protected function prefixedName()
    {
        return ($this->prefix ? $this->prefix.':' : '').$this->localName;
    }

    /**
     * @return bool|null|IContextReader
     */
    public function read()
    {
        if (parent::read()) {
            switch ($this->nodeType) {
                case EXmlReader::ELEMENT:
                    $this->fromRoot();
                    $this->activateContextReader();
                    if ($this->contextReader) {
                        $this->contextReader->startElement();
                    }
                    break;
                case EXmlReader::TEXT:
                case EXmlReader::CDATA:
                    if ($this->contextReader) {
                        $this->contextReader->addText();
                    }
                    break;
                case EXmlReader::END_ELEMENT:
                    $this->toRoot();
                    if ($this->contextReader) {
                        $this->contextReader->endElement();
                    }
                    if (($reader = $this->deactivateContextReader())) {
                        return $reader;
                    } else {
                        return true;
                    }
                    break;
                default:
                    ;
            }

            return true;
        } else {
            return false;
        }
    }

    public function readComponent()
    {
        while (($res = $this->read())) {
            if ($res instanceof IContextReader) {
                return true;
            }
        }

        return false;
    }

    public function getContent()
    {
        return $this->toOutputReader->getContent();
    }
}
