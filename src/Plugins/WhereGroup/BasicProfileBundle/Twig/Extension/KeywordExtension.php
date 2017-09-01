<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Twig\Extension;

use Doctrine\ORM\EntityManagerInterface;

/**
 * Class KeywordExtension
 * @package Plugins\WhereGroup\BasicProfileBundle\Twig\Extension
 */
class KeywordExtension extends \Twig_Extension
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * KeywordExtension constructor.
     * @param EntityManagerInterface $em
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('get_keyword_repo', array($this, 'getKeywordRepo')),
            new \Twig_SimpleFunction('get_keywords', array($this, 'getKeywordByProfile')),
        );
    }

    /**
     * @param $name
     * @return array
     */
    public function getKeywordRepo($name)
    {
        $entity = $this
            ->em
            ->getRepository('MetadorBasicProfileBundle:Keyword')
            ->findOneByIdentifier($name);

        if ($entity) {
            return array(
                'name' => $entity->getTitle(),
                'date' => $entity->getDate(),
                'type' => $entity->getDateType(),
                'options' => array_combine($entity->getKeywords(), $entity->getKeywords())
            );
        }

        return array();
    }

    /**
     * @param $profile
     */
    public function getKeywordByProfile($profile)
    {

    }

    /**
     * @return string
     */
    public function getName()
    {
        return "metador_keys";
    }
}
