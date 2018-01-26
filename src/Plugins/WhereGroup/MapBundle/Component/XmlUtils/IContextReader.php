<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace Plugins\WhereGroup\MapBundle\Component\XmlUtils;

/**
 * Description of IContextReader
 *
 * @author Paul Schmidt<panadium@gmx.de>
 */
interface IContextReader
{
    /**
     * Resets a reader components.
     */
    public function reset();

    /**
     * Reads an element
     */
    public function startElement();

    /**
     * Closes a read action
     */
    public function endElement();

    /**
     * Adds a text
     */
    public function addText();

    /**
     * Returns a content.
     * @return mixed
     */
    public function getContent();
}
