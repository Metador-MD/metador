<?php

namespace WhereGroup\CoreBundle\Component\Search;

use Doctrine\ORM\EntityManagerInterface;

/**
 * Class DatabaseSearch
 * @package WhereGroup\CoreBundle\Component\Search
 */
class DatabaseSearch extends Search implements SearchInterface
{
    const ENTITY = "MetadorCoreBundle:Metadata";

    /** @var EntityManagerInterface|null */
    protected $em = null;

    /** @var \Doctrine\ORM\QueryBuilder|null */
    protected $qb = null;

    /** @param EntityManagerInterface $em */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
        $this->qb = $em
            ->getRepository(self::ENTITY)
            ->createQueryBuilder('m');
    }

    /**
     * @return array
     */
    public function find()
    {
        if ($this->getGroups()) {
            $this->qb->leftJoin('m.groups', 'g');
        }
        if ($this->expression) {
            $this->qb
                ->add('where', $this->expression->getExpression())
                ->setParameters($this->expression->getParameters());
        }

        // Searchterms
        if (is_array($this->getTerms())) {
            $index = 0;
            foreach ($this->getTerms() as $term) {
                $this->qb
                    ->andWhere('LOWER(m.searchfield) LIKE :termX'.$index)
                    ->setParameter('termX'.$index, "%".strtolower($term)."%");
            }
            unset($index);
        }

        if (!empty($this->getSource())) {
            $this->qb->andWhere('m.source = :sourceX')->setParameter('sourceX', $this->getSource());
        }

        if (!empty($this->getProfile())) {
            if (is_array($this->getProfile())) {
                $this->qb->andWhere($this->qb->expr()->in('m.profile', $this->getProfile()));
            } elseif (is_string($this->getProfile())) {
                $this->qb->andWhere('m.profile = :profileX')->setParameter('profileX', $this->getProfile());
            }
        }

        return [
            'paging' => $this->getResultPaging(),
            'rows'   => $this->getResult(),
        ];
    }

    /**
     * @return array
     */
    public function getResult()
    {
        $this->qb->select('m.object');

        if (!is_null($this->offset)) {
            $this->qb->setFirstResult($this->offset);
        }

        if (!is_null($this->hits)) {
            $this->qb->setMaxResults($this->hits);
        }

        return $this->qb->getQuery()->getArrayResult();
    }

    /**
     * @return mixed
     * @throws \Doctrine\ORM\NoResultException
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getResultCount()
    {
        return $this->qb
            ->select('count(m)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * @return DatabaseExprHandler
     */
    public function createExpression()
    {
        return new DatabaseExprHandler(['metadata' => 'm', 'group' => 'g'], 'metadata', self::MAP_QUERY2SOURCE);
    }

    /**
     * @param Expression $expression
     * @return $this
     */
    public function setExpression(Expression $expression)
    {
        $this->expression = $expression;

        return $this;
    }
}
