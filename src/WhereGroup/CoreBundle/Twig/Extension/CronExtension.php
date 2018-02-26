<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Cron\CronExpression;

/**
 * Class CronExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class CronExtension extends \Twig_Extension
{
    /**
     * @return array
     */
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('cron_next_run_date', array($this, 'cronNextRunDate'))
        );
    }

    /**
     * @param $entity
     * @return \DateTime
     */
    public function cronNextRunDate($entity)
    {
        return CronExpression::factory(trim(
            $entity->getMin() . ' ' .
            $entity->getHour() . ' ' .
            $entity->getDayOfMonth() . ' ' .
            $entity->getMonth() . ' ' .
            $entity->getDayOfWeek() . ' ' .
            $entity->getYear()
        ))->getNextRunDate();
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_cron";
    }
}
