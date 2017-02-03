<?php

namespace WhereGroup\CoreBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * Class ConfigurationRepository
 * @package WhereGroup\CoreBundle\Entity
 */
class ConfigurationRepository extends EntityRepository
{
    private $entity = 'MetadorCoreBundle:Configuration';

    public function get($key, $filterType, $filterValue)
    {
        return $this->getEntityManager()->createQuery(
            //...
        )->getResult();
    }

    public function set($key, $value, $filterType, $filterValue)
    {
        return $this->getEntityManager()->createQuery(
            //...
        )->getResult();
    }

}
