<?php

namespace WhereGroup\CoreBundle\Component\Search;

use Doctrine\ORM\EntityManagerInterface;

/**
 * Class DatabaseSearch
 * @package WhereGroup\CoreBundle\Component\Search
 */
class DatabaseSearch extends Search implements SearchInterface
{
    /** @var EntityManagerInterface|null  */
    protected $em = null;

    /** @var \Doctrine\ORM\QueryBuilder|null  */
    protected $qb = null;

    const ENTITY = "MetadorCoreBundle:Metadata";

    /** @param EntityManagerInterface $em */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
        $this->qb = $em
            ->getRepository(self::ENTITY)
            ->createQueryBuilder('m');
    }

    /**
     * @return $this
     */
    public function find()
    {
        // Searchterms
        if (is_array($this->getTerms())) {
            $termCount = 0;
            foreach ($this->getTerms() as $term) {
                $this->qb
                    ->andWhere('LOWER(m.searchfield) LIKE :term' . $termCount)
                    ->setParameter('term' . $termCount, "%" . strtolower($term) . "%");
            }
            unset($termCount);
        }

        if (!empty($this->getSource())) {
            $this->qb->andWhere('m.source = :source')->setParameter('source', $this->getSource());
        }

        return $this;
    }

    /**
     * @return array
     */
    public function getResult()
    {
        return $this->qb
            ->select('m.object')
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
            ->select('count(m)')
            ->getQuery()
            ->getSingleScalarResult();
    }
}
