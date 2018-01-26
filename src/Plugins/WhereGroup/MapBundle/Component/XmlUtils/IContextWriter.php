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
interface IContextWriter
{
    /**
     * @param array $content
     * @return mixed content
     */
    public function write(array $content);

    /**
     * @return mixed
     */
    public function reset();
}
