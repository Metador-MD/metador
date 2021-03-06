<?php

namespace WhereGroup\CoreBundle\Twig\Extension;

use Cron\CronExpression;
use DateTime;
use Twig_Extension;
use Twig_SimpleFilter;

/**
 * Class CronExtension
 * @package WhereGroup\CoreBundle\Twig\Extension
 */
class CronExtension extends Twig_Extension
{
    /**
     * @return array
     */
    public function getFilters()
    {
        return [
            new Twig_SimpleFilter('cron_next_run_date', [$this, 'cronNextRunDate'])
        ];
    }

    /**
     * @param $entity
     * @return DateTime
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
