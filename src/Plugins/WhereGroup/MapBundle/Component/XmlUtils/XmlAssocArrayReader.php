<?php
/**
 * Created by PhpStorm.
 * User: paul
 * Date: 19.06.17
 * Time: 14:05
 */

namespace Plugins\WhereGroup\MapBundle\Component\XmlUtils;


class XmlAssocArrayReader implements IContextReader
{

    const KEY_ATTRS = '_attrs_';
    const KEY_NAME = '_name_';
    const KEY_VALUE = '_value_';
    const KEY_CHILDREN = '_children_';

    /**
     * @var EXmlReader xml reader
     */
    protected $xmlReader;
    /**
     * @var IContextWriter
     */
    protected $writer;
    /**
     * @var array
     */
    protected $xmlAssocArray;

    /**
     * @var array
     */
    protected $path;

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

    public function getWriter()
    {
        return $this->writer;
    }

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

    public function endElement()
    {
        $last = array_pop($this->path);
    }

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

    public function addText()
    {
        $this->path[count($this->path) - 1][self::KEY_VALUE] = $this->xmlReader->value;
    }


    public function reset()
    {
        $this->xmlAssocArray = null;
        $this->path = null;
        if ($this->writer) {
            $this->writer->reset();
        }
    }

    public function getContent()
    {
        return $this->writer->write($this->xmlAssocArray);
    }
}