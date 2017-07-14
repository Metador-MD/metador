<?php

namespace Plugins\WhereGroup\MapBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
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
        $wms = $options['data'];
        $builder
            ->add('gcUrl',TextType::class, array(
                'label' => 'GetCapabilities Url (schreibgeschützt)',
                'read_only' =>'true'))
            ->add('title', TextType::class, array(
                'label' => 'Title',
                'invalid_message' => 'Der Titel darf nicht leer sein.'))
            ->add('format', ChoiceType::class, array(
                'label' => 'Format',
                'choices' => array_combine($wms->getFormats(), $wms->getFormats())))
            ->add('layers', ChoiceType::class, array(
                'multiple' => true,
                'label' => 'Layers',
                'choices' => array_combine($wms->getLayerList(), $wms->getLayerList())))
            ->add('opacity', ChoiceType::class, array(
                'label' => 'Opacity',
                'choices' => array_combine(
                    range(0.0, 1.0, 0.1), range(0.0, 1.0, 0.1))))
            ->add('priority', NumberType::class, array('label' => 'Priority'))
            ->add('visible', CheckboxType::class, array('label' => 'Visible'));
    }
}
