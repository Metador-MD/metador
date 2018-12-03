<?php

namespace WhereGroup\CoreBundle\Component\Utils;

class Stopwatch
{
    protected $start;
    protected $stop;

    public function __construct()
    {
        $this->start = microtime(true);
    }

    /**
     * @return array
     * @throws \Exception
     */
    public function stop()
    {
        $this->stop = microtime(true);
        return $this->getDuration();
    }

    /**
     * @param string $format
     * @return string
     * @throws \Exception
     */
    public function getStartTime($format = 'H:i:s.u')
    {
        return ($this->createDateTime($this->start))->format($format);
    }

    /**
     * @param string $format
     * @return string
     * @throws \Exception
     */
    public function getStopTime($format = 'H:i:s.u')
    {
        return ($this->createDateTime($this->stop))->format($format);
    }

    /**
     * @return array
     * @throws \Exception
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
     * @return \DateTime
     * @throws \Exception
     */
    protected function createDateTime($microtime)
    {
        return new \DateTime(date('Y-m-d H:i:s.' . $this->getMilliseconds($microtime), $microtime));
    }

    /**
     * @param $microtime
     * @return string
     */
    protected function getMilliseconds($microtime)
    {
        return sprintf("%06d", ($microtime - floor($microtime)) * 1000000);
    }
}
