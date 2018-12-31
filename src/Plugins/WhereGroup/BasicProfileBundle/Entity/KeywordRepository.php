<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * Class KeywordRepository
 * @package Plugins\WhereGroup\BasicProfileBundle\Entity
 */
class KeywordRepository extends EntityRepository
{
    public function getByProfile($profile)
    {
        return $this
            ->getEntityManager()
            ->getRepository("MetadorBasicProfileBundle:Keyword")
            ->createQueryBuilder('k')
            ->select('k')
            ->where('k.profiles like :profile')
            ->setParameters(['profile' => '%"' . $profile . '"%'])
            ->getQuery()
            ->getResult();
    }
}
