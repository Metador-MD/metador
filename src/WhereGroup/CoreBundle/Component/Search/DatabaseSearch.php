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
        if ($this->expression) {
            $this->qb
                ->add('where', $this->expression->getExpression())
                ->setParameters($this->expression->getParameters());
        }

        // Searchterms
        if (is_array($this->getTerms())) {
            $termCount = 0;
            foreach ($this->getTerms() as $term) {
                $this->qb
                    ->andWhere('LOWER(m.searchfield) LIKE :termX'.$termCount)
                    ->setParameter('termX'.$termCount, "%".strtolower($term)."%");
            }
            unset($termCount);
        }

        if (!empty($this->getSource())) {
            $this->qb->andWhere('m.source = :sourceX')->setParameter('sourceX', $this->getSource());
        }

        if (!empty($this->getProfile())) {
            $this->qb->andWhere('m.profile = :profileX')->setParameter('profileX', $this->getProfile());
        }

        return [
            'paging' => $this->getResultPaging(),
            'rows'   => $this->getResult()
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
        return new DatabaseExprHandler('m', self::MAP_QUERY2SOURCE);
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
