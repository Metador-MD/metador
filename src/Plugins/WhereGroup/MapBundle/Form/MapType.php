<?php

namespace WhereGroup\CoreBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class MapType extends AbstractType
{

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('crs', TextType::class, array('label' => 'Crs'))
            ->add('crsList', TextType::class, array('label' => 'CrsList'))
            ->add('startBbox', TextType::class, array('label' => 'StartBbox'))
            ->add('maxBbox', TextType::class, array('label' => 'MaxBbox'));
    }
}
