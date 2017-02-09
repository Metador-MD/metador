<?php

namespace WhereGroup\CoreBundle\Component;

class ProfilePictureTransformation
{
    private $profilePicture;
    
    public function __construct($profilePicture)
    {
        $this->profilePicture = $profilePicture;
    }

    public function getImageBase64Encode()
    {
        return base64_encode($this->profilePicture);
    }
    
    
    public function resizeProfilePicture($width, $height)
    {
        $destImage = imagecreatetruecolor($width, $height);
        $srcImage = imagecreatefromstring(file_get_contents($this->profilePicture));

        imagecopyresized($destImage, $srcImage, 0, 0, 0, 0, $width, $height, imagesx($srcImage), imagesy($srcImage));

        ob_start();
        imagejpeg($destImage);
        $this->profilePicture = ob_get_contents();
        ob_end_clean();

        imagedestroy($destImage);
        imagedestroy($srcImage);
    }
}
