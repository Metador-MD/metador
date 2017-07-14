<?php

namespace Plugins\WhereGroup\MapBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;

/**
 * Class WmsNewType
 * @package Plugins\WhereGroup\MapBundle\Form
 */
class WmsNewType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', HiddenType::class, array('data' => 'Undefined'))
            ->add('gcUrl', TextType::class, array('label' => 'Url'));
    }
}
