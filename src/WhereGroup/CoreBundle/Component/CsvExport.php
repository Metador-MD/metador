<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * Class CsvExport
 * @package WhereGroup\CoreBundle\Component
 */
class CsvExport
{
    protected $authorizationChecker;

    /**
     * CsvExport constructor.
     * @param AuthorizationCheckerInterface $authorizationChecker
     */
    public function __construct(AuthorizationCheckerInterface $authorizationChecker)
    {
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __destruct()
    {
        unset($this->authorizationChecker);
    }
    /**
     * @param $rows
     * @return array
     */
    public function buildCsvArray($rows) : array
    {
        $data = [];

        if (is_array($rows)) {
            $data[] = ['uuid', 'title'];

            foreach ($rows as $row) {
                $row = json_decode($row['object'], true);
                $data[] = [$row['_uuid'], $row['title']];
            }
        }

        return $data;
    }
}
