<?php

namespace WhereGroup\PluginBundle\Entity;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class Plugin
 * @package WhereGroup\PluginBundle\Entity
 * @author A.R.Pour
 */
class Plugin
{
   /**
    * @Assert\File(
    *     maxSize = "3072k",
    *     mimeTypes = {
    *         "application/zip",
    *         "application/x-zip",
    *         "application/octet-stream",
    *         "application/x-zip-compressed"
    *     },
    *     mimeTypesMessage = "Bitte Metador2 Plugin hochladen."
    * )
    */
    protected $attachment;

    public function getAttachment()
    {
        return $this->attachment;
    }

    /**
     * @param $attachment
     * @return $this
     */
    public function setAttachment($attachment)
    {
        $this->attachment = $attachment;

        return $this;
    }
}
