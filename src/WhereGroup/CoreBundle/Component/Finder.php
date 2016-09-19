<?php

namespace WhereGroup\CoreBundle\Component;

use Doctrine\DBAL\Query\QueryBuilder;

class Finder
{
    public $page = null;
    public $hits = null;
    public $order = null;
    public $terms = null;
    public $profile = null;
    public $public = null;
    public $groups = array();
    public $geoOffice = false;
    public $userId = null;
    public $force = null;

    /**
     * @param QueryBuilder $qb
     */
    public function getFilter($qb, $count = false)
    {
        // Paging
        if ($count && (!is_null($this->page) || !is_null($this->hits))) {
            $this->page = !is_null($this->page) ? (int)$this->page : 1;
            $this->hits = !is_null($this->hits) ? (int)$this->hits : 10;

            $qb ->setFirstResult($this->page * $this->hits - $this->hits)
                ->setMaxResults($this->hits);
        }

        // Sort
        if ($count && !is_null($this->order)) {
            $qb->orderBy("m." . $this->order, 'ASC');
        }

        // Search
        if (!is_null($this->terms)) {
            foreach (explode(" ", $this->terms) as $term) {
                $qb ->andWhere('m.searchfield LIKE :term')
                    ->setParameter('term', "%" . $term . "%");
            }
        }

        // Profile
        if (!is_null($this->profile)) {
            $qb
                ->andWhere('m.profile = :profile')
                ->setParameter('profile', (string)$this->profile);
        }

        // Only public if no user logged in
        if (is_null($this->userId)) {
            $this->public = true;
        }

        // Public
        if (!is_null($this->public)) {
            $qb
                ->andWhere('m.public = :public')
                ->setParameter('public', (bool)$this->public);
        }

        // Owner or user in same group
        if (!$this->geoOffice && is_null($this->public) && !is_null($this->userId)) {
            $qb ->andWhere('m.insertUser = :userid')
                ->setParameter('userid', (int)$this->userId)
                ->orWhere('m.public = true');

            if (!empty($this->groups)) {
                $qb->leftJoin('m.groups', 'g', 'WITH');

                foreach ($this->groups as $key => $groupId) {
                    $qb
                        ->orWhere('g.id = :group_' . $key)
                        ->setParameter('group_' . $key, (int)$groupId);
                }
            }
        }
    }
}
