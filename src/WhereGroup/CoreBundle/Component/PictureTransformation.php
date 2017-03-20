<?php

namespace WhereGroup\CoreBundle\Component;

class PictureTransformation
{
    private $picture;
    
    public function __construct($picture)
    {
        $this->picture = $picture;
    }

    public function getImageBase64Encode()
    {
        return base64_encode($this->picture);
    }
    
    
    public function resizeProfilePicture($width, $height)
    {
        $destImage = imagecreatetruecolor($width, $height);
        $srcImage = imagecreatefromstring(file_get_contents($this->picture));

        imagecopyresized($destImage, $srcImage, 0, 0, 0, 0, $width, $height, imagesx($srcImage), imagesy($srcImage));

        ob_start();
        imagejpeg($destImage);
        $this->picture = ob_get_contents();
        ob_end_clean();

        imagedestroy($destImage);
        imagedestroy($srcImage);
    }
}
