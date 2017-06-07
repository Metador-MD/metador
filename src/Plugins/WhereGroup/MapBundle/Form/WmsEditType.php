<?php

namespace Plugins\WhereGroup\MapBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;

/**
 * Class WmsEditType
 * @package Plugins\WhereGroup\MapBundle\Form
 */
class WmsEditType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $formats = isset($options['formats']) ? $options['formats'] : array();
        $layers = isset($options['layerList']) ? $options['layerList'] : array();
        $builder
            ->add('title', TextType::class, array('label' => 'Title'))
            ->add('format', ChoiceType::class, array(
                'label' => 'Format',
                'choices' => array_combine ($formats , $formats)))
            ->add('layers', ChoiceType::class, array(
                'multiple' => true,
                'label' => 'Layers',
                'choices' => array_combine ($layers , $layers)))
            ->add('opacity', NumberType::class, array('label' => 'Opacity'))
            ->add('priority', NumberType::class, array('label' => 'Priority'));
    }
}
