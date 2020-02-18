<?php

namespace WhereGroup\CoreBundle\Component\Utils;

use DateTime;
use Exception;

/**
 * Class Stopwatch
 * @package WhereGroup\CoreBundle\Component\Utils
 */
class Stopwatch
{
    protected $start;
    protected $stop;

    /**
     * Stopwatch constructor.
     */
    public function __construct()
    {
        list($usec, $sec) = explode(" ", microtime());
        $this->start = ((float)$usec + (float)$sec);
    }

    /**
     * @return array
     * @throws Exception
     */
    public function stop()
    {
        list($usec, $sec) = explode(" ", microtime());
        $this->stop = ((float)$usec + (float)$sec);

        return $this->getDuration();
    }

    /**
     * @return float
     */
    public function duration()
    {
        return (string)round($this->stop - $this->start, 3);
    }

    /**
     * @param string $format
     * @return string
     * @throws Exception
     */
    public function getStartTime($format = 'H:i:s')
    {
        return ($this->createDateTime($this->start))->format($format);
    }

    /**
     * @param string $format
     * @return string
     * @throws Exception
     */
    public function getStopTime($format = 'H:i:s')
    {
        return ($this->createDateTime($this->stop))->format($format);
    }

    /**
     * @return array
     * @throws Exception
     */
    public function getDuration()
    {
        $date = ($this->createDateTime($this->start))->diff($this->createDateTime($this->stop));

        return [
            'd' => $date->format('%a'),
            'h' => $date->format('%h'),
            'i' => $date->format('%i'),
            's' => $date->format('%s'),
            'u' => $this->getMilliseconds($this->stop - $this->start)
        ];
    }

    /**
     * @param $microtime
     * @return DateTime
     * @throws Exception
     */
    protected function createDateTime($microtime)
    {
        return new DateTime(date('Y-m-d H:i:s.' . $this->getMilliseconds($microtime), $microtime));
    }

    /**
     * @param $microtime
     * @return string
     */
    protected function getMilliseconds($microtime)
    {
        return sprintf("%06d", ($microtime - floor($microtime)) * 1000000);
    }

    /**
     * @return string
     * @throws Exception
     */
    public function __toString()
    {
        $duration = $this->getDuration();

        return '' . $this->getStartTime() . ' - ' . $this->getStopTime() . '. Dauer: '
            . $duration['h'] . ' Stunden, '
            . $duration['i'] . ' Minuten, '
            . $duration['s'] . ' Sekunden, '
            . $duration['u'] . ' Millisekunden.';
    }
}
