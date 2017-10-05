<?php

namespace Plugins\WhereGroup\MapBundle\Component\XmlUtils;

/**
 * Class XmlAssocArrayReader
 * @package Plugins\WhereGroup\MapBundle\Component\XmlUtils
 * @author Paul Schmidt <panadium@gmx.de>
 */
class XmlAssocArrayReader implements IContextReader
{

    const KEY_ATTRS = '_attrs_';
    const KEY_NAME = '_name_';
    const KEY_VALUE = '_value_';
    const KEY_CHILDREN = '_children_';

    /* @var EXmlReader xml reader */
    protected $xmlReader;
    /* @var IContextWriter */
    protected $writer;
    /* @var array */
    protected $xmlAssocArray;

    /* @var array */
    protected $path;

    /**
     * XmlAssocArrayReader constructor.
     * @param EXmlReader $xmlReader
     * @param IContextWriter|null $writer
     */
    public function __construct(EXmlReader $xmlReader, IContextWriter $writer = null)
    {
        $this->xmlReader = $xmlReader;
        $this->writer = $writer;
        $this->xmlAssocArray = array();
    }

    /**
     * @param EXmlReader $xmlReader
     */
    public function setXmlReader(EXmlReader $xmlReader)
    {
        $this->xmlReader = $xmlReader;
    }

    /**
     * @return IContextWriter
     */
    public function getWriter()
    {
        return $this->writer;
    }

    /**
     * Called by start element
     */
    public function startElement()
    {
        $node = array(
            self::KEY_NAME => $this->xmlReader->name,
        );
        if (($attrs = $this->getAttrs())) {
            $node[self::KEY_ATTRS] = $attrs;
        }
        if (!$this->path) {
            $this->path = array();
            $this->xmlAssocArray = array($node);
            $this->path[] =& $this->xmlAssocArray[0];
        } else {
            $parentPos = count($this->path) - 1;
            $this->path[$parentPos][self::KEY_CHILDREN][] = $node;
            $last = count($this->path[$parentPos][self::KEY_CHILDREN]) - 1;
            $this->path[] =& $this->path[$parentPos][self::KEY_CHILDREN][$last];
        }
    }

    /**
     * Called by end element
     */
    public function endElement()
    {
        $last = array_pop($this->path);
    }

    /**
     * @return array|null
     */
    public function getAttrs()
    {
        if ($this->xmlReader->hasAttributes) {
            $attrs = array();
            $attributeCount = $this->xmlReader->attributeCount;
            for ($i = 0; $i < $attributeCount; $i++) {
                $this->xmlReader->moveToAttributeNo($i);
                $attrs[$this->xmlReader->name] = $this->xmlReader->value;
            }
            $this->xmlReader->moveToElement();

            return $attrs;
        } else {
            return null;
        }
    }

    /**
     * Adds text
     */
    public function addText()
    {
        $this->path[count($this->path) - 1][self::KEY_VALUE] = $this->xmlReader->value;
    }

    /**
     * Resets a path
     */
    public function reset()
    {
        $this->xmlAssocArray = null;
        $this->path = null;
        if ($this->writer) {
            $this->writer->reset();
        }
    }

    /**
     * @return mixed
     */
    public function getContent()
    {
        return $this->writer->write($this->xmlAssocArray);
    }
}
