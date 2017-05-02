<?php

namespace WhereGroup\CoreBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;

class WmsEditType extends AbstractType
{

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
