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

    /** @var EntityManagerInterface|null  */
    protected $em = null;

    /** @var \Doctrine\ORM\QueryBuilder|null  */
    protected $qb = null;

    /**  @var string */
    protected $alias = 'm';

    /** @var array|null */
    protected $parameters = null;

    /** @param EntityManagerInterface $em */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
        $this->qb = $em
            ->getRepository(self::ENTITY)
            ->createQueryBuilder($this->alias);
    }

    /**
     * @return $this
     */
    public function find()
    {
        if ($this->filter && $this->parameters) {
            $this->qb
                ->add('where', $this->filter)
                ->setParameters($this->parameters);
        }

        // Searchterms
        if (is_array($this->getTerms())) {
            $termCount = 0;
            foreach ($this->getTerms() as $term) {
                $this->qb
                    ->andWhere('LOWER(' . $this->alias . '.searchfield) LIKE :termX' . $termCount)
                    ->setParameter('termX' . $termCount, "%" . strtolower($term) . "%");
            }
            unset($termCount);
        }

        if (!empty($this->getSource())) {
            $this->qb->andWhere($this->alias.'.source = :sourceX')->setParameter('sourceX', $this->getSource());
        }

        if (!empty($this->getProfile())) {
            $this->qb->andWhere($this->alias.'.profile = :profileX')->setParameter('profileX', $this->getProfile());
        }


        return $this;
    }

    /**
     * @return array
     */
    public function getResult()
    {
        return $this->qb
            ->select($this->alias.'.object')
            ->setFirstResult($this->offset)
            ->setMaxResults($this->hits)
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * @return mixed
     */
    public function getResultCount()
    {
        return $this->qb
            ->select('count(' . $this->alias . ')')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * @return DatabaseExpression
     */
    public  function createExpression()
    {
        return new DatabaseExpression($this->alias);
    }

    /**
     * @param $expression
     * @return $this
     */
    public  function useExpression($expression)
    {
        /**  @var DatabaseExpression $expression */
        $this->filter = $expression->getExpression();
        $this->parameters = $expression->getParameters();
        return $this;
    }
}
