<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * Class KeywordRepository
 * @package Plugins\WhereGroup\BasicProfileBundle\Entity
 */
class KeywordRepository extends EntityRepository
{
    /**
     * @param $profile
     * @return mixed
     */
    public function getByProfile($profile)
    {
        return $this
            ->createQueryBuilder('k')
            ->select('k')
            ->where('k.profiles like :profile')
            ->setParameters(['profile' => '%"' . $profile . '"%'])
            ->getQuery()
            ->getResult();
    }
}
